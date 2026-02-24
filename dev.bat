@echo off
SET NODE_PATH=%~dp0node_bin
SET PATH=%NODE_PATH%;%NODE_PATH%\node_modules\.bin;%PATH%
%NODE_PATH%\npm.cmd %*
