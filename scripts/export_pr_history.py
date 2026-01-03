#!/usr/bin/env python3
"""
Export PR History Script

This script exports Pull Request history from the repository to JSON format,
which can be used to create a development journal or timeline.

Features:
- Export all PRs with detailed metadata (number, title, state, dates, author, etc.)
- Optionally export detailed PR comments and reviews for each PR
- Save to JSON files suitable for processing with AI tools like ChatGPT

Usage:
    # Export basic PR list
    python scripts/export_pr_history.py

    # Export PR list with specific limit
    python scripts/export_pr_history.py --limit 100

    # Export PR list with detailed comments and reviews
    python scripts/export_pr_history.py --with-details

    # Specify output file
    python scripts/export_pr_history.py --output my_pr_log.json
"""

import argparse
import json
import subprocess
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional


def run_gh_command(command: List[str]) -> Optional[str]:
    """
    Run a GitHub CLI command and return the output.
    
    Args:
        command: List of command parts to execute
        
    Returns:
        Command output as string if successful, or None if command failed.
        Returns None in the following cases:
        - GitHub CLI returns non-zero exit code (authentication errors, API errors, etc.)
        - GitHub CLI is not installed (FileNotFoundError)
        
    Note:
        Error messages are printed to stderr but no exceptions are raised.
        Caller should check for None return value and handle appropriately.
    """
    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {' '.join(command)}", file=sys.stderr)
        print(f"Error message: {e.stderr}", file=sys.stderr)
        return None
    except FileNotFoundError:
        print("Error: GitHub CLI (gh) not found. Please install it first.", file=sys.stderr)
        print("Visit: https://cli.github.com/", file=sys.stderr)
        return None


def get_repository_name() -> Optional[str]:
    """
    Get the repository name from git remote.
    
    Returns:
        Repository name in format 'owner/repo', or None if not found
    """
    try:
        result = subprocess.run(
            ["git", "remote", "get-url", "origin"],
            capture_output=True,
            text=True,
            check=True
        )
        url = result.stdout.strip()
        
        # Parse different git URL formats
        # Remove .git suffix if present
        if url.endswith(".git"):
            url = url[:-4]
        
        if url.startswith("https://github.com/"):
            # https://github.com/owner/repo or https://github.com/owner/repo.git
            path = url[len("https://github.com/"):]
            parts = path.split("/")
        elif url.startswith("git@github.com:"):
            # git@github.com:owner/repo or git@github.com:owner/repo.git
            path = url[len("git@github.com:"):]
            parts = path.split("/")
        elif url.startswith("http://github.com/"):
            # http://github.com/owner/repo (less common, but possible)
            path = url[len("http://github.com/"):]
            parts = path.split("/")
        else:
            # Not a recognized GitHub URL format
            return None
        
        if len(parts) >= 2:
            return f"{parts[0]}/{parts[1]}"
        return None
    except subprocess.CalledProcessError:
        return None


def export_pr_list(repo: str, limit: int = 200, output_file: str = "pr_log.json") -> bool:
    """
    Export list of all PRs to JSON file.
    
    Args:
        repo: Repository name in format 'owner/repo'
        limit: Maximum number of PRs to fetch
        output_file: Output JSON file path
        
    Returns:
        True if successful, False otherwise
    """
    print(f"Exporting PR list from {repo}...")
    print(f"Fetching up to {limit} PRs...")
    
    command = [
        "gh", "pr", "list",
        "--repo", repo,
        "--state", "all",
        "--limit", str(limit),
        "--json", "number,title,state,createdAt,updatedAt,mergedAt,closedAt,author,baseRefName,headRefName,url,body"
    ]
    
    output = run_gh_command(command)
    if output is None:
        return False
    
    try:
        # Parse JSON to validate it
        pr_data = json.loads(output)
        print(f"Successfully fetched {len(pr_data)} PRs")
        
        # Write to file
        output_path = Path(output_file)
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(pr_data, f, indent=2, ensure_ascii=False)
        
        print(f"✓ PR list exported to: {output_path.absolute()}")
        return True
        
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON output: {e}", file=sys.stderr)
        return False
    except IOError as e:
        print(f"Error writing to file: {e}", file=sys.stderr)
        return False


def export_pr_details(repo: str, pr_number: int, output_dir: Path) -> Optional[Dict[str, Any]]:
    """
    Export detailed information for a specific PR including comments and reviews.
    
    Args:
        repo: Repository name in format 'owner/repo'
        pr_number: PR number to fetch details for
        output_dir: Directory to save detailed PR JSON files
        
    Returns:
        PR detail data as dict, or None if failed
    """
    command = [
        "gh", "pr", "view", str(pr_number),
        "--repo", repo,
        "--json", "number,title,createdAt,mergedAt,closedAt,updatedAt,state,author,baseRefName,headRefName,url,body,comments,reviews"
    ]
    
    output = run_gh_command(command)
    if output is None:
        return None
    
    try:
        pr_detail = json.loads(output)
        
        # Save individual PR detail file
        detail_file = output_dir / f"pr_{pr_number}_detail.json"
        with open(detail_file, 'w', encoding='utf-8') as f:
            json.dump(pr_detail, f, indent=2, ensure_ascii=False)
        
        return pr_detail
        
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error processing PR #{pr_number}: {e}", file=sys.stderr)
        return None


def export_all_pr_details(repo: str, limit: int = 200, output_dir: str = "pr_details") -> bool:
    """
    Export detailed information for all PRs including comments and reviews.
    
    Args:
        repo: Repository name in format 'owner/repo'
        limit: Maximum number of PRs to process
        output_dir: Directory to save detailed PR JSON files
        
    Returns:
        True if successful, False otherwise
    """
    print(f"\nExporting detailed PR information from {repo}...")
    
    # First get the list of all PRs
    command = [
        "gh", "pr", "list",
        "--repo", repo,
        "--state", "all",
        "--limit", str(limit),
        "--json", "number"
    ]
    
    output = run_gh_command(command)
    if output is None:
        return False
    
    try:
        pr_list = json.loads(output)
        print(f"Found {len(pr_list)} PRs to process")
        
        # Create output directory
        detail_dir = Path(output_dir)
        detail_dir.mkdir(exist_ok=True)
        
        # Fetch details for each PR
        # Note: Using sequential API calls here is intentional. The GitHub CLI (gh)
        # handles rate limiting automatically, and parallel requests could hit rate
        # limits or overwhelm the API. For most repositories with <200 PRs, this
        # completes in a reasonable time. For very large repositories, users can
        # use the --limit flag to process PRs in batches.
        all_details = []
        for i, pr in enumerate(pr_list, 1):
            pr_number = pr['number']
            print(f"[{i}/{len(pr_list)}] Fetching details for PR #{pr_number}...")
            
            pr_detail = export_pr_details(repo, pr_number, detail_dir)
            if pr_detail:
                all_details.append(pr_detail)
        
        # Also create a combined file with all details
        combined_file = detail_dir / "all_prs_detailed.json"
        with open(combined_file, 'w', encoding='utf-8') as f:
            json.dump(all_details, f, indent=2, ensure_ascii=False)
        
        print(f"\n✓ Exported {len(all_details)} PRs with details to: {detail_dir.absolute()}")
        print(f"✓ Combined details saved to: {combined_file.absolute()}")
        print(f"✓ Individual PR files saved to: {detail_dir.absolute()}/pr_*_detail.json")
        
        return True
        
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error processing PRs: {e}", file=sys.stderr)
        return False


def main():
    """Main entry point for the script."""
    parser = argparse.ArgumentParser(
        description="Export Pull Request history from GitHub repository to JSON format for creating a dev journal.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Export basic PR list (default: pr_log.json)
  python scripts/export_pr_history.py

  # Export with custom output file
  python scripts/export_pr_history.py --output my_timeline.json

  # Export with detailed comments and reviews
  python scripts/export_pr_history.py --with-details

  # Export with details to custom directory
  python scripts/export_pr_history.py --with-details --details-dir my_pr_details

  # Specify repository explicitly
  python scripts/export_pr_history.py --repo owner/repository

  # Limit number of PRs
  python scripts/export_pr_history.py --limit 50
        """
    )
    
    parser.add_argument(
        "--repo",
        help="Repository in format 'owner/repo' (default: auto-detect from git remote)"
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=200,
        help="Maximum number of PRs to fetch (default: 200)"
    )
    parser.add_argument(
        "--output",
        default="pr_log.json",
        help="Output file for PR list (default: pr_log.json)"
    )
    parser.add_argument(
        "--with-details",
        action="store_true",
        help="Also export detailed PR information including comments and reviews"
    )
    parser.add_argument(
        "--details-dir",
        default="pr_details",
        help="Directory for detailed PR files when using --with-details (default: pr_details)"
    )
    
    args = parser.parse_args()
    
    # Determine repository
    repo = args.repo
    if not repo:
        repo = get_repository_name()
        if not repo:
            print("Error: Could not determine repository name.", file=sys.stderr)
            print("Please specify --repo owner/repository", file=sys.stderr)
            sys.exit(1)
    
    print(f"Target repository: {repo}")
    print("=" * 60)
    
    # Export basic PR list
    success = export_pr_list(repo, args.limit, args.output)
    if not success:
        sys.exit(1)
    
    # Export detailed PR information if requested
    if args.with_details:
        success = export_all_pr_details(repo, args.limit, args.details_dir)
        if not success:
            sys.exit(1)
    
    print("\n" + "=" * 60)
    print("✓ Export complete!")
    print("\nNext steps:")
    print(f"1. Review the exported JSON file(s)")
    print(f"2. Use the JSON data to create your dev journal with ChatGPT or other tools")
    print(f"3. The exported data includes PR titles, descriptions, dates, authors, and more")
    if args.with_details:
        print(f"4. Detailed PR files include comments and review discussions")


if __name__ == "__main__":
    main()
