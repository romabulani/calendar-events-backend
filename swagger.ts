import swaggerAutogen from "swagger-autogen";

const outputFile = "./src/swagger-output.json";
const endpointsFiles = ["./src/index.ts"]; // Specify the paths of your controller files

swaggerAutogen(outputFile, endpointsFiles)