const electron = require('electron'),
	notifier = require('node-notifier'),
	app = electron.app,
	BrowserWindow = electron.BrowserWindow;

if (handleSquirrelEvent(app)) { return; }

const Not = electron.Notification;
const dialog = electron.dialog

const path = require('path')
const url = require('url')
const fs = require('fs')
const Tray = electron.Tray
const Menu = electron.Menu
let isQuiting = false;
app.showExitPrompt = true
let mainWindow,
	iconPath = 'resources/icon3.ico';

function createWindow() {
	mainWindow = new BrowserWindow({
		titleBarStyle: 'hidden',
		width: 900,
		minWidth: 220,
		height: 700,
		minHeight: 200,
		icon: __dirname + '/' + iconPath,
		darkTheme: true,
		movable: true,
		frame: false,
	});

	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'src/index.html'),
		protocol: 'file:',
		slashes: true
	}));

	function notifyState() {
		notifier.notify({
			title: 'Info',
			message: 'App continua em execusão.',
			icon: path.join(__dirname, iconPath),
			sound: false
		});
		mainWindow.flashFrame(true);
	}

	let tray = new Tray(__dirname + '/' + iconPath);

	var contextMenu = Menu.buildFromTemplate([
		{
			label: 'Abrir',
			//icon: __dirname + '/resources/icon.png',
			accelerator: 'CmdOrCtrl+R',
			click: function () {
				mainWindow.show();
			}
		},
		{
			type: 'separator'
		},
		{
			label: 'Sair',
			//type: 'radio',
			click: function () {
				isQuiting = true;
				app.quit();
			}
		}
	]);

	tray.setToolTip('Auto Pblish');
	tray.setContextMenu(contextMenu);
	//mainWindow.setKiosk(true) // TELA CHEIA
	mainWindow.setAutoHideMenuBar(true)
	mainWindow.setMenuBarVisibility(false)

	mainWindow.webContents.openDevTools()

	mainWindow.on('close', (e) => {
		app.quit();
		mainWindow = null;
		return;

		if (!isQuiting) {
			e.preventDefault()
			mainWindow.hide();
			notifyState();
		} else {
			app.quit();
			mainWindow = null;
		}
	})

	mainWindow.on('minimize', function (event) {
		return;
		event.preventDefault();
		mainWindow.hide();
		notifyState();
	});
}

app.on('ready', createWindow);

app.on('window-all-closed', function (event) {
	event.preventDefault();
	if (process.platform !== 'darwin') {
		app.quit()
	}
});

app.on('activate', function () {
	if (mainWindow === null) {
		createWindow()
	}
});

app.on('activate-with-no-open-windows', function () {
	mainWindow.show();
});

//INSTALLER
function handleSquirrelEvent(application) {
	if (process.argv.length === 1) {
		return false;
	}

	const ChildProcess = require('child_process');
	const path = require('path');

	const appFolder = path.resolve(process.execPath, '..');
	const rootAtomFolder = path.resolve(appFolder, '..');
	const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
	const exeName = path.basename(process.execPath);

	const spawn = function (command, args) {
		let spawnedProcess, error;

		try {
			spawnedProcess = ChildProcess.spawn(command, args, {
				detached: true
			});
		} catch (error) { }

		return spawnedProcess;
	};

	const spawnUpdate = function (args) {
		return spawn(updateDotExe, args);
	};

	const squirrelEvent = process.argv[1];
	switch (squirrelEvent) {
		case '--squirrel-install':
		case '--squirrel-updated':
			// Optionally do things such as:
			// - Add your .exe to the PATH
			// - Write to the registry for things like file associations and
			//   explorer context menus

			// Install desktop and start menu shortcuts
			spawnUpdate(['--createShortcut', exeName]);

			setTimeout(application.quit, 1000);
			return true;

		case '--squirrel-uninstall':
			// Undo anything you did in the --squirrel-install and
			// --squirrel-updated handlers

			// Remove desktop and start menu shortcuts
			spawnUpdate(['--removeShortcut', exeName]);

			setTimeout(application.quit, 1000);
			return true;

		case '--squirrel-obsolete':
			// This is called on the outgoing version of your app before
			// we update to the new version - it's the opposite of
			// --squirrel-updated

			application.quit();
			return true;
	}
};
