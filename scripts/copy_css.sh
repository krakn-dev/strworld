#!/bin/bash

if [[ ! -d ./dist/ ]]; then
    mkdir dist
fi

cp src/styles.css dist
