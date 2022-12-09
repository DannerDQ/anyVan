import winotify
from flask import Flask, request
from os import system, path, chmod
import json

chmod('./notifier.py', 0o777)

app = Flask(__name__)

def notify(msg, title, launch="", app_id = "Book it Now!", icon = path.abspath("./img/notify.png")):
  r = winotify.Registry(app_id)
  notifier = winotify.Notifier(r)
  notification = notifier.create_notification(title, msg, icon, launch=launch)
  notification.audio = winotify.audio.Default
  return {"notification": notification, "notifier": notifier}

@app.post("/")
def home():
  data = request.get_data()
  data = json.loads(data)

  msg, title, launch = data["msg"],data["title"],data["launch"]
  notificationObj = notify(msg, title)
  notification = notificationObj["notification"]

  notification.add_actions("Open", launch)
  notification.add_actions("Close", "")
  notification.show()
  return "OKEY"

@app.post("/error")
def error():
  notificationObj = notify('An error occurred while trying to overwrite the file "oldData.json", check if the file has the extension ".json" or if it is not corrupt', "Writing Error", "","AnyVanScraper", path.abspath("./img/error.png"))
  notification = notificationObj["notification"]

  notification.add_actions("Close", "")
  notification.show()
  return "OKEY"

@app.post("/closeScraper")
def closeScraper():
  notificationObj = notify("Do you want to start AnyVanScraper again?", "AnyVanScraper has stopped", "", "AnyVanScraper", path.abspath("./img/warn.png"))
  notification = notificationObj["notification"]
  notifier = notificationObj["notifier"]

  @notifier.register_callback
  def launchAnyVanScraper():
    abs_path = path.abspath('./scraper.js')
    system(f"node {abs_path}")

  notification.add_actions("Restart AnyVanScraper", launchAnyVanScraper)
  notification.add_actions("Close", "")
  notification.show()
  return "OKEY"

if __name__ == "__main__":
  app.run(debug=True, port=1000, host="localhost")