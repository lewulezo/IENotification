rm js/*
tsc ts/IENotification.ts --outDir js/ -target es5 --sourceMap -d
tsc ts/IENotificationHelper.ts --outDir js/ -target es5 --sourceMap
lessc less/notification.less css/notification.css --source-map
