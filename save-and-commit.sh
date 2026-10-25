#!/bin/bash

# Script to save and commit all changes before closing VS Code
echo "Checking for uncommitted changes..."

# Check if there are any changes
if ! git diff-index --quiet HEAD --; then
    echo "Found uncommitted changes. Adding all files..."
    git add .
    
    # Prompt for commit message
    read -p "Enter commit message (or press Enter for default): " commit_msg
    
    if [ -z "$commit_msg" ]; then
        commit_msg="Auto-commit: $(date)"
    fi
    
    echo "Committing changes..."
    git commit -m "$commit_msg"
    
    # Ask if user wants to push
    read -p "Push to remote? (y/n): " push_confirm
    if [ "$push_confirm" = "y" ] || [ "$push_confirm" = "Y" ]; then
        echo "Pushing to remote..."
        git push
        echo "Changes pushed successfully!"
    fi
else
    echo "No uncommitted changes found."
fi

echo "All changes are saved!"
