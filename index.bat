if exist ".\sage" rd /s/q ".\sage"
if not exist ".\sage" md ".\sage"

if exist ".\sage" del ".\sage" /Y
robocopy "..\release" ".\sage" /E

emrun --port 6931 index.html