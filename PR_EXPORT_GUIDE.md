# PR History Export - Quick Start Guide

This guide helps you export your GitHub Pull Request history to create a development journal.

## What You'll Get

- **JSON export** of all your PRs with titles, descriptions, dates, and authors
- **Optional detailed export** including all comments and review discussions
- Data ready to feed into ChatGPT or other AI tools to generate a dev journal

## Prerequisites

1. **GitHub CLI** - Install from https://cli.github.com/
2. **Authentication** - Login to GitHub CLI:
   ```bash
   gh auth login
   ```

## Quick Start

### 1. Export Basic PR List

This creates a simple list of all PRs:

```bash
python scripts/export_pr_history.py
```

**Output**: `pr_log.json` - Contains all PRs with metadata

### 2. Export with Details (Recommended)

This includes comments and review discussions:

```bash
python scripts/export_pr_history.py --with-details
```

**Output**: 
- `pr_log.json` - Basic PR list
- `pr_details/` - Individual PR detail files
- `pr_details/all_prs_detailed.json` - Combined detailed export

### 3. Create Your Dev Journal

Once you have the JSON file(s):

1. **Upload to ChatGPT** (or your preferred AI tool)
2. **Use a prompt like this**:
   ```
   I have a JSON export of my GitHub Pull Requests. Please analyze this data 
   and create a development journal that:
   - Summarizes the project's evolution chronologically
   - Highlights major features and improvements
   - Groups related changes together
   - Notes interesting technical decisions or challenges
   - Creates a narrative of the development journey
   
   Here's the JSON data: [paste your JSON]
   ```

## Common Options

```bash
# Limit number of PRs
python scripts/export_pr_history.py --limit 50

# Custom output file
python scripts/export_pr_history.py --output my_timeline.json

# Specify repository explicitly
python scripts/export_pr_history.py --repo owner/repository

# Get help
python scripts/export_pr_history.py --help
```

## Example Output

### Basic PR List (`pr_log.json`):

```json
[
  {
    "number": 42,
    "title": "Add Spotify analytics dashboard",
    "state": "MERGED",
    "createdAt": "2025-12-01T10:00:00Z",
    "mergedAt": "2025-12-02T15:30:00Z",
    "updatedAt": "2025-12-02T15:30:00Z",
    "closedAt": "2025-12-02T15:30:00Z",
    "author": {
      "login": "username"
    },
    "baseRefName": "main",
    "headRefName": "feature/spotify",
    "url": "https://github.com/owner/repo/pull/42",
    "body": "This PR adds a Spotify analytics dashboard with OCR parsing..."
  }
]
```

### Detailed PR Export (with `--with-details`):

Includes everything above plus:

```json
{
  "comments": [
    {
      "author": {"login": "reviewer"},
      "body": "Looks good! Just one suggestion...",
      "createdAt": "2025-12-01T14:00:00Z"
    }
  ],
  "reviews": [
    {
      "author": {"login": "reviewer"},
      "state": "APPROVED",
      "body": "Great work!",
      "submittedAt": "2025-12-02T10:00:00Z"
    }
  ]
}
```

## Tips for Best Results

### For Your Dev Journal:

1. **Include PR descriptions** - Write meaningful PR descriptions when you create PRs
2. **Use labels** - Label PRs by type (feature, bugfix, docs, etc.)
3. **Write good commit messages** - These show up in PR discussions
4. **Export regularly** - Create snapshots at project milestones

### For AI Processing:

1. **Start with basic export** - Faster and easier to process
2. **Use details for deep dives** - When you want to include team discussions
3. **Filter by date** - Focus on specific time periods
4. **Combine with other data** - Add commit history, issue discussions, etc.

## Troubleshooting

### "gh: command not found"

Install GitHub CLI: https://cli.github.com/

### "To use GitHub CLI... set the GH_TOKEN"

You need to authenticate:
```bash
gh auth login
```

Follow the prompts to login with your GitHub account.

### "Could not determine repository name"

You're not in a git repository or the remote isn't set. Specify explicitly:
```bash
python scripts/export_pr_history.py --repo owner/repository
```

### "No PRs found"

- Check if the repository has any PRs
- Verify you have access to the repository
- Try specifying the repo explicitly with `--repo`

## Example Workflow

Here's a complete workflow to create your dev journal:

```bash
# 1. Navigate to your project
cd /path/to/your/project

# 2. Authenticate with GitHub (one-time)
gh auth login

# 3. Export PR history with details
python scripts/export_pr_history.py --with-details

# 4. Review the exported files
ls -la pr_log.json pr_details/

# 5. Open pr_details/all_prs_detailed.json
# 6. Copy the content
# 7. Paste into ChatGPT with your prompt
# 8. Save the generated dev journal
```

## Advanced Usage

### Export Multiple Repositories

Create a script to export from multiple repos:

```bash
#!/bin/bash
repos=("owner/repo1" "owner/repo2" "owner/repo3")

for repo in "${repos[@]}"; do
  python scripts/export_pr_history.py \
    --repo "$repo" \
    --output "${repo//\//_}_pr_log.json" \
    --with-details \
    --details-dir "${repo//\//_}_details"
done
```

### Combine with Git Log

Export both PRs and commits for a complete picture:

```bash
# Export PR history
python scripts/export_pr_history.py --with-details

# Export git log
git log --all --pretty=format:'{"commit":"%H","author":"%an","date":"%ai","message":"%s"},' > git_log.json
```

## What's Next?

After creating your dev journal:

1. **Share it** - Include in README or documentation
2. **Update it regularly** - Run the export periodically
3. **Analyze trends** - Look at development patterns over time
4. **Create timelines** - Visualize your project's evolution
5. **Improve documentation** - Use insights to update docs

## Need Help?

- Check `scripts/README.md` for detailed documentation
- Run `python scripts/export_pr_history.py --help` for all options
- Open an issue on GitHub if you encounter problems

Happy journaling! 📝
