# Diablo
Scrape task worker for **Open Weeb Repository** projects

### What this service do?
1. Recive RabbitMQ message for scrape task
1. Scrape project and save it to db according to received message

## Environment Config
1. ``DB_CONN`` Mongo DB Connection
1. ``QUEUE_CONN`` Amqp connection 
1. ``QUEUE_PROJECT_SCRAPPER`` project scrapper queue name
