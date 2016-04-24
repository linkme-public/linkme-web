cd /tmp

# try to remove the repo if it already exists
rm -rf linkme-public; true

git clone https://github.com/vandop/linkme-public.git

cd linkme-public/linkme-chatapp

npm install

node .