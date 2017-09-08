FROM node:7.7
#FROM    centos:centos7

# Enable EPEL for Node.js
#RUN yum install -y epel-release

# Install Node.js and npm
#RUN yum install -y npm

# Bundle app source
COPY . /src

# Install app dependencies
RUN cd /src; npm install

ENV NODE_ENV=development
ENV MONGO_URL=mongodb://mongo/psdapi
ENV API_URL=https://api.psd401.net
ENV TOKEN_SECRET=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiU2VydmljZSBBY2NvdW50IC0gUGFzc3dvcmQgUmVzZXQiLCJlbWFpbCI6ImhhZ2Vsa0Bwc2Q0MDEubmV0In0.R0AG1_UsqIiPycqfrLeGrN0vFVjDPjbHqB0pHVzNm1w

EXPOSE 8079
CMD ["node", "--harmony", "src/index.js"]
