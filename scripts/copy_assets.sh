if [[ ! -d ./dist/ ]]; then
    mkdir dist
fi

if [[ -d ./dist/assets ]]; then 
    rm -r ./dist/assets
fi

mkdir ./dist/assets/

find ./art/ \
    \( -name "*.glb" -o -name "*.mp3" \) \
    -type f -exec cp {} dist/assets \;
