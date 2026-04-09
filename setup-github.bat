@echo off
cd /d c:\Users\Admin\Desktop\AnatoliaSpring

echo Initializing Git repository...
git init

echo Configuring Git user...
git config user.email "your-email@example.com"
git config user.name "Your Name"

echo Adding all files...
git add .

echo Creating initial commit...
git commit -m "Initial commit: Anatolia Spring - Bottle Sales & Payroll Tracker"

echo.
echo ============================================
echo Git repository created successfully!
echo.
echo Next steps:
echo 1. Create a new repository on GitHub.com
echo 2. Run one of these commands to add the remote:
echo.
echo    git remote add origin https://github.com/YOUR-USERNAME/AnatoliaSpring.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 3. Then go to Vercel and connect your GitHub repository
echo ============================================

pause
