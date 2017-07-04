# working on docker-impress
docker run -it -p 8080:8888 -p 35720:35729 -v ~/npm-impress:/home/enxajt/npm-impress -v ~/Notes/impress-md:/home/enxajt/npm-impress/impress-md --hostname impress --add-host=impress:128.0.0.1 -e TZ=Europe/Paris impress

made npm-impress dir on the host after this command

node impress @ inside containner

#*TODO?*
##  > </br>
body$ >
空白 > 1行:そのまま or 2行以上:</br>
## #の下に#連続 >
同種 > </br>
'## > 空白1行

# history
## watch
 - npm-shell: "watch": "watch 'npm run ejs' ./src/ --include='*.impress.md'"
 - watch.sh
 <ok> node impress
## .impress.md > .html
 - replace.sh
 - pandoc : can not modify rule
 <ok> replace.sh > markdown-it
## .html > .pdf
<ok> decktape
