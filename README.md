# group-15-cs348

Installing node and necessary packages
1. Install node and npm (node package manager) on your machine, use google to find out how
2. navigate to the main directory containing server.js in a terminal
3. run command "node init", then hit enter using all of the default values until finished
4. run command "npm install express ejs mysql2 body-parser --save"

Running the node server
1. navigate to the main project directory in a terminal
2. run command "node server"
3. put "localhost:8080" into a web browser

In order for it to work in this state, you will have to have mysql installed on your machine, then use the .sql files in google drive and mysql workbench to construct a database on your local machine. Your username must be "root" (I think it's set to this by default), and your sql password must be "password". This isn't technically safe but we aren't actually hosting this online so it doesn't matter. There are resources online for how to change your sql password if you already set one, but if you're downloading sql for the first time you should be prompted to set it upon install.
