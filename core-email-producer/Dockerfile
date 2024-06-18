FROM node:18 
WORKDIR /app
COPY package*.json ./


# Update npm | Install pnpm | Set PNPM_HOME | Install global packages
RUN npm i -g npm@latest; \
 # Install pnpm
 npm install -g pnpm; \
 pnpm --version; \
 pnpm setup; \
 mkdir -p /usr/local/share/pnpm &&\
 export PNPM_HOME="/usr/local/share/pnpm" &&\
 export PATH="$PNPM_HOME:$PATH"; \
 pnpm bin -g &&\
 # Install dependencies
 pnpm add -g pm2 &&\
 pnpm add -g @nestjs/cli &&\
 pnpm install



COPY . . 

RUN pnpm run build 

CMD [ "pnpm", "run", "start:prod" ]