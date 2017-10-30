#!/bin/bash

cd client
rm -Rf dist
yarn
yarn run dist

cd ../AtemMacroEditor
rm -Rf dist
dotnet restore
#dotnet build -o dist -f netcoreapp2.0 -c Release -r debian.8-x64
dotnet publish -o dist -c Debug -r debian.8-x64

rm -Rf dist/wwwroot
cp -r ../client/dist dist/wwwroot/
cp appsettings.json dist/
rm dist/config.json
