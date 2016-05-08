cd /tmp

# try to remove the repo if it already exists
rm -rf linkme-web; true

git clone https://github.com/linkme-public/linkme-web.git

cd linkme-web/linkme-chatapp

npm install

npm start