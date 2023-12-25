#!/bin/bash

if [[ ! -d ./dist/ ]]; then
    mkdir dist
fi

cp src/index.html dist
