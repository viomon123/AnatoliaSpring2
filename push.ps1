#!/usr/bin/env pwsh
cd c:\Users\Admin\Desktop\AnatoliaSpring
Write-Host "Setting git remote with token..."
git remote remove origin 2>/dev/null
git remote add origin "https://viomon12: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@github.com/viomon12/AnatoliaSpring.git"
Write-Host "Pushing to GitHub..."
git push -u origin main
Write-Host "Done!"
