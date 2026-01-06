#!/usr/bin/env python3
"""
OCR Validation Script

Validates the OCR parser against example screenshots with ground truth annotations.
This helps identify parsing issues and track accuracy improvements.
Provides detailed per-field accuracy metrics and mismatch analysis.
"""

import json
import sys
from pathlib import Path
from typing import Dict, List, Tuple, Any
from datetime import datetime
from collections import defaultdict
import pytz

# Import the parsing function from the main script
from parse_screenshots import extract_text_from_image, parse_spotify_stats


def load_ground_truth(json_path: Path) -> Dict[str, Any]:
    """Load ground truth data from a JSON file."""
    with open(json_path, 'r') as f:
        data = json.load(f)
    
    # Remove comment fields (fields starting with _comment)
    expected = data.get('expected_stats', {})
    clean_expected = {
        k: v for k, v in expected.items() 
        if not k.startswith('_comment') and v is not None
    }
    
    return {
        'description': data.get('description', ''),
        'expected_stats': clean_expected,
        'notes': data.get('notes', '')
    }


def compare_values(expected: Any, actual: Any, field: str) -> Tuple[bool, str]:
    """
    Compare expected and actual values for a field.
    Returns (matches, message).
    """
    # Handle missing values
    if actual is None:
        return False, f"Missing (expected: {expected})"
    
    # Handle lists (cities, countries)
    if isinstance(expected, list):
        if not isinstance(actual, list):
            return False, f"Type mismatch: expected list, got {type(actual).__name__}"
        
        # For geography lists, compare as sets of (name, listeners) tuples
        if field in ['top_cities', 'top_countries']:
            expected_set = {(item['name'], item['listeners']) for item in expected}
            actual_set = {(item['name'], item['listeners']) for item in actual}
            
            if expected_set == actual_set:
                return True, "Exact match"
            
            # Check partial matches
            matches = expected_set & actual_set
            missing = expected_set - actual_set
            extra = actual_set - expected_set
            
            msg_parts = []
            if matches:
                msg_parts.append(f"{len(matches)}/{len(expected)} correct")
            if missing:
                msg_parts.append(f"Missing: {missing}")
            if extra:
                msg_parts.append(f"Extra: {extra}")
            
            return False, ", ".join(msg_parts)
    
    # Handle strings (percentages)
    if isinstance(expected, str):
        if expected == actual:
            return True, "Exact match"
        return False, f"Mismatch: expected '{expected}', got '{actual}'"
    
    # Handle numbers
    if isinstance(expected, (int, float)):
        if expected == actual:
            return True, "Exact match"
        
        # For floats, allow small tolerance
        if isinstance(expected, float) and isinstance(actual, (int, float)):
            if abs(expected - actual) < 0.1:
                return True, f"Close match ({actual})"
        
        return False, f"Mismatch: expected {expected}, got {actual}"
    
    # Generic comparison
    if expected == actual:
        return True, "Exact match"
    
    return False, f"Mismatch: expected {expected}, got {actual}"


def validate_screenshot(image_path: Path, ground_truth_path: Path) -> Dict[str, Any]:
    """
    Validate OCR parsing of a screenshot against ground truth.
    Returns a validation report.
    """
    print(f"\n{'='*70}")
    print(f"Validating: {image_path.name}")
    print(f"{'='*70}")
    
    # Load ground truth
    ground_truth = load_ground_truth(ground_truth_path)
    expected_stats = ground_truth['expected_stats']
    
    print(f"Description: {ground_truth['description']}")
    if ground_truth['notes']:
        print(f"Notes: {ground_truth['notes']}")
    print(f"Expected fields: {len(expected_stats)}")
    
    # Extract and parse
    print("\nRunning OCR extraction...")
    text = extract_text_from_image(image_path)
    actual_stats = parse_spotify_stats(text)
    
    print(f"Extracted fields: {len(actual_stats)}")
    
    # Compare results
    results = {
        'image': image_path.name,
        'description': ground_truth['description'],
        'total_expected': len(expected_stats),
        'total_extracted': len(actual_stats),
        'correct': 0,
        'incorrect': 0,
        'missing': 0,
        'extra': 0,
        'details': []
    }
    
    # Check expected fields
    all_fields = set(expected_stats.keys()) | set(actual_stats.keys())
    
    for field in sorted(all_fields):
        expected_val = expected_stats.get(field)
        actual_val = actual_stats.get(field)
        
        if expected_val is None and actual_val is not None:
            # Extra field not in ground truth
            results['extra'] += 1
            results['details'].append({
                'field': field,
                'status': 'extra',
                'expected': None,
                'actual': actual_val,
                'message': 'Extracted but not in ground truth'
            })
        elif expected_val is not None and actual_val is None:
            # Missing expected field
            results['missing'] += 1
            results['details'].append({
                'field': field,
                'status': 'missing',
                'expected': expected_val,
                'actual': None,
                'message': 'Not extracted'
            })
        elif expected_val is not None and actual_val is not None:
            # Compare values
            matches, message = compare_values(expected_val, actual_val, field)
            
            if matches:
                results['correct'] += 1
                results['details'].append({
                    'field': field,
                    'status': 'correct',
                    'expected': expected_val,
                    'actual': actual_val,
                    'message': message
                })
            else:
                results['incorrect'] += 1
                results['details'].append({
                    'field': field,
                    'status': 'incorrect',
                    'expected': expected_val,
                    'actual': actual_val,
                    'message': message
                })
    
    # Print results
    print(f"\n{'Results:':<20}")
    print(f"{'  ✓ Correct:':<20} {results['correct']}")
    print(f"{'  ✗ Incorrect:':<20} {results['incorrect']}")
    print(f"{'  ⚠ Missing:':<20} {results['missing']}")
    print(f"{'  + Extra:':<20} {results['extra']}")
    
    # Calculate accuracy
    if results['total_expected'] > 0:
        accuracy = (results['correct'] / results['total_expected']) * 100
        results['accuracy'] = accuracy
        print(f"{'  Accuracy:':<20} {accuracy:.1f}%")
    else:
        results['accuracy'] = 0
        print(f"{'  Accuracy:':<20} N/A (no expected fields)")
    
    # Print details for non-correct fields
    issues = [d for d in results['details'] if d['status'] != 'correct']
    if issues:
        print(f"\n{'Issues:'}")
        for detail in issues:
            status_icon = {'missing': '⚠', 'incorrect': '✗', 'extra': '+'}[detail['status']]
            print(f"  {status_icon} {detail['field']:<30} {detail['message']}")
            if detail['status'] == 'incorrect':
                print(f"    Expected: {detail['expected']}")
                print(f"    Actual:   {detail['actual']}")
    
    return results


def validate_all_examples(examples_dir: Path) -> List[Dict[str, Any]]:
    """
    Validate all example screenshots in the directory.
    Returns a list of validation reports.
    """
    # Find all image files with corresponding JSON files
    image_extensions = {'.png', '.jpg', '.jpeg', '.gif', '.bmp'}
    
    examples = []
    for image_file in sorted(examples_dir.iterdir()):
        if image_file.suffix.lower() not in image_extensions:
            continue
        
        # Look for corresponding JSON file
        json_file = image_file.with_suffix('.json')
        if not json_file.exists():
            print(f"\n⚠ Warning: No ground truth file found for {image_file.name}")
            print(f"  Expected: {json_file.name}")
            continue
        
        examples.append((image_file, json_file))
    
    if not examples:
        print("\n⚠ No example screenshots found with ground truth annotations.")
        print(f"   Directory: {examples_dir}")
        print("\n   To add examples:")
        print("   1. Add a screenshot (e.g., example.png)")
        print("   2. Create a ground truth file (e.g., example.json)")
        print("   3. See examples/README.md for format details")
        return []
    
    print(f"\nFound {len(examples)} example(s) with ground truth annotations")
    
    # Validate each example
    all_results = []
    for image_path, json_path in examples:
        try:
            result = validate_screenshot(image_path, json_path)
            all_results.append(result)
        except Exception as e:
            print(f"\n✗ Error validating {image_path.name}: {e}")
            import traceback
            traceback.print_exc()
    
    return all_results


def print_summary(all_results: List[Dict[str, Any]]):
    """Print overall summary of validation results with per-field breakdown."""
    if not all_results:
        return
    
    print(f"\n{'='*70}")
    print("OVERALL SUMMARY")
    print(f"{'='*70}")
    
    total_examples = len(all_results)
    total_correct = sum(r['correct'] for r in all_results)
    total_incorrect = sum(r['incorrect'] for r in all_results)
    total_missing = sum(r['missing'] for r in all_results)
    total_extra = sum(r['extra'] for r in all_results)
    total_expected = sum(r['total_expected'] for r in all_results)
    
    print(f"{'Examples validated:':<30} {total_examples}")
    print(f"{'Total expected fields:':<30} {total_expected}")
    print(f"{'  ✓ Correct extractions:':<30} {total_correct}")
    print(f"{'  ✗ Incorrect extractions:':<30} {total_incorrect}")
    print(f"{'  ⚠ Missing extractions:':<30} {total_missing}")
    print(f"{'  + Extra extractions:':<30} {total_extra}")
    
    if total_expected > 0:
        overall_accuracy = (total_correct / total_expected) * 100
        print(f"\n{'Overall Accuracy:':<30} {overall_accuracy:.1f}%")
    
    # Per-field accuracy breakdown
    print(f"\n{'='*70}")
    print("PER-FIELD ACCURACY")
    print(f"{'='*70}")
    
    # Collect statistics per field
    field_stats = defaultdict(lambda: {'correct': 0, 'incorrect': 0, 'missing': 0, 'total': 0})
    
    for result in all_results:
        for detail in result['details']:
            field = detail['field']
            status = detail['status']
            
            if status == 'correct':
                field_stats[field]['correct'] += 1
                field_stats[field]['total'] += 1
            elif status == 'incorrect':
                field_stats[field]['incorrect'] += 1
                field_stats[field]['total'] += 1
            elif status == 'missing':
                field_stats[field]['missing'] += 1
                field_stats[field]['total'] += 1
            # 'extra' fields are not counted in total expected
    
    # Group fields by category
    field_categories = {
        'Core Metrics': [
            'listeners', 'listeners_change',
            'streams', 'streams_change',
            'streams_per_listener', 'streams_per_listener_change',
            'saves', 'saves_change',
            'playlist_adds', 'playlist_adds_change',
            'followers', 'followers_change'
        ],
        'Demographics - Gender': [
            'gender_male', 'gender_female',
            'gender_non_binary', 'gender_not_specified'
        ],
        'Demographics - Age': [
            'age_under_18', 'age_18_24', 'age_25_34',
            'age_35_44', 'age_45_54', 'age_55_64', 'age_65_plus'
        ],
        'Geography': ['top_cities', 'top_countries'],
        'Discovery Sources': [
            'discovery_active_total', 'discovery_programmed_total', 'discovery_other',
            'discovery_artist_profile', 'discovery_own_playlists', 'discovery_listener_queue',
            'discovery_algorithmic_playlists', 'discovery_other_playlists', 'discovery_radio_autoplay'
        ]
    }
    
    for category, fields in field_categories.items():
        print(f"\n{category}:")
        category_correct = 0
        category_total = 0
        
        for field in fields:
            if field in field_stats:
                stats = field_stats[field]
                correct = stats['correct']
                total = stats['total']
                category_correct += correct
                category_total += total
                
                if total > 0:
                    accuracy = (correct / total) * 100
                    status_icon = '✓' if accuracy >= 90 else '⚠' if accuracy >= 50 else '✗'
                    print(f"  {status_icon} {field:<40} {correct:>2}/{total:<2} ({accuracy:>5.1f}%)")
                else:
                    print(f"  - {field:<40} {'N/A'}")
        
        # Category summary
        if category_total > 0:
            category_accuracy = (category_correct / category_total) * 100
            print(f"  {'Category Total:':<40} {category_correct}/{category_total} ({category_accuracy:.1f}%)")
    
    # Print per-example summary
    print(f"\n{'='*70}")
    print("PER-EXAMPLE RESULTS")
    print(f"{'='*70}")
    for result in all_results:
        accuracy_str = f"{result['accuracy']:.1f}%" if result['accuracy'] > 0 else "N/A"
        status = "✓" if result['accuracy'] >= 95 else "⚠" if result['accuracy'] >= 70 else "✗"
        print(f"  {status} {result['image']:<40} {accuracy_str:>6} "
              f"({result['correct']}/{result['total_expected']})")


def main():
    """Main entry point."""
    import argparse
    
    # Parse command line arguments
    parser = argparse.ArgumentParser(
        description='Validate OCR parser against ground truth examples'
    )
    parser.add_argument(
        '--debug',
        action='store_true',
        help='Enable debug mode with verbose output'
    )
    parser.add_argument(
        '--examples-dir',
        type=str,
        help='Directory containing example screenshots (default: screenshots/examples/)'
    )
    parser.add_argument(
        '--output-file',
        type=str,
        help='Output JSON file for validation results (default: data/validation-results.json)'
    )
    
    args = parser.parse_args()
    
    # Get the repository root
    script_dir = Path(__file__).parent
    repo_root = script_dir.parent
    examples_dir = Path(args.examples_dir) if args.examples_dir else repo_root / 'screenshots' / 'examples'
    output_file = Path(args.output_file) if args.output_file else repo_root / 'data' / 'validation-results.json'
    
    print("=" * 70)
    print("OCR VALIDATION - Testing Parser Against Ground Truth Examples")
    print("=" * 70)
    print(f"Examples directory: {examples_dir}")
    print(f"Output file: {output_file}")
    print(f"Debug mode: {'ON' if args.debug else 'OFF'}")
    
    if not examples_dir.exists():
        print(f"\n✗ Error: Examples directory not found: {examples_dir}")
        print("\n  The examples directory should contain:")
        print("  - Example screenshots (*.png, *.jpg, etc.)")
        print("  - Ground truth JSON files (*.json)")
        print("  - README.md with instructions")
        return 1
    
    # Validate all examples
    all_results = validate_all_examples(examples_dir)
    
    if not all_results:
        print("\n⚠ No validation performed. Add example screenshots and ground truth files.")
        print("   See screenshots/examples/README.md for instructions.")
        return 0
    
    # Print summary
    print_summary(all_results)
    
    # Save detailed results to JSON
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    # Get current time in UTC
    utc = pytz.UTC
    current_time = datetime.now(utc)
    
    # Calculate per-field accuracy
    field_accuracy = defaultdict(lambda: {'correct': 0, 'total': 0})
    for result in all_results:
        for detail in result['details']:
            if detail['status'] in ['correct', 'incorrect', 'missing']:
                field = detail['field']
                field_accuracy[field]['total'] += 1
                if detail['status'] == 'correct':
                    field_accuracy[field]['correct'] += 1
    
    # Convert to percentage
    field_accuracy_pct = {
        field: (stats['correct'] / stats['total'] * 100) if stats['total'] > 0 else 0
        for field, stats in field_accuracy.items()
    }
    
    with open(output_file, 'w') as f:
        json.dump({
            'validation_date': current_time.isoformat(),
            'timezone': 'UTC',
            'examples_validated': len(all_results),
            'overall_accuracy': (sum(r['correct'] for r in all_results) / sum(r['total_expected'] for r in all_results) * 100) if sum(r['total_expected'] for r in all_results) > 0 else 0,
            'field_accuracy': field_accuracy_pct,
            'results': all_results
        }, f, indent=2)
    
    print(f"\n✓ Detailed results saved to: {output_file}")
    
    # Return exit code based on overall accuracy
    if all_results:
        total_expected = sum(r['total_expected'] for r in all_results)
        total_correct = sum(r['correct'] for r in all_results)
        if total_expected > 0:
            overall_accuracy = (total_correct / total_expected) * 100
            if overall_accuracy < 80:
                print("\n⚠ Warning: Overall accuracy is below 80%")
                print("   Consider:")
                print("   - Reviewing the preprocessing parameters")
                print("   - Checking if ground truth matches what's visible in screenshots")
                print("   - Testing with different Tesseract configurations")
                return 1
    
    return 0


if __name__ == '__main__':
    try:
        exit(main())
    except KeyboardInterrupt:
        print("\n\n⚠ Validation interrupted by user")
        exit(130)
    except Exception as e:
        print(f"\n✗ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
