@echo off
SET NODE_PATH=%~dp0node_bin
SET PATH=%NODE_PATH%;%NODE_PATH%\node_modules\.bin;%PATH%
IF "%1"=="dev"     %NODE_PATH%\npm.cmd run dev
IF "%1"=="build"   %NODE_PATH%\npm.cmd run build
IF "%1"=="test"    %NODE_PATH%\npm.cmd run test
IF "%1"=="lint"    %NODE_PATH%\npm.cmd run lint
IF "%1"=="preview" %NODE_PATH%\npm.cmd run preview
IF "%1"=="audit"   %NODE_PATH%\npm.cmd audit --audit-level=high
