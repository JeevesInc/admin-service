FROM public.ecr.aws/a5v5m6q6/node:18.18.2-alpine3.18

ARG GHP_TOKEN
ENV GITHUB_TOKEN=$GHP_TOKEN

WORKDIR /home/node

COPY package.json package-lock.json ./

RUN echo //npm.pkg.github.com/:_authToken=$GITHUB_TOKEN > ~/.npmrc
RUN echo @JeevesInc:registry=https://npm.pkg.github.com/ >> ~/.npmrc

RUN npm ci
RUN echo > ~/.npmrc

COPY . .

RUN npm run build

USER node
CMD ["npm","run" "start-prod"]
