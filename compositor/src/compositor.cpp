#include "compositor.h"
#include <QtGui>

Compositor::Compositor(QWidget *parent, Qt::WFlags flags) : QMainWindow(parent, flags) {
	ui.setupUi(this);

	settings = new QSettings("RSOLP Compositor", "KevinKarsch");

	compositebits = NULL;

	//Image loading
	mapperLoadImage = new QSignalMapper(this);
	QObject::connect(mapperLoadImage, SIGNAL(mapped(int)), this, SLOT(loadImage(int)));
	mapperLoadImage->setMapping(ui.backgroundBrowse, IM_BACKGROUND);
	QObject::connect(ui.backgroundBrowse, SIGNAL(clicked()), mapperLoadImage, SLOT(map()));
	mapperLoadImage->setMapping(ui.renderBrowse, IM_RENDER);
	QObject::connect(ui.renderBrowse, SIGNAL(clicked()), mapperLoadImage, SLOT(map()));
	mapperLoadImage->setMapping(ui.emptyBrowse, IM_EMPTY);
	QObject::connect(ui.emptyBrowse, SIGNAL(clicked()), mapperLoadImage, SLOT(map()));
	mapperLoadImage->setMapping(ui.maskBrowse, IM_MASK);
	QObject::connect(ui.maskBrowse, SIGNAL(clicked()), mapperLoadImage, SLOT(map()));

	//Image reloading
	mapperReloadImage = new QSignalMapper(this);
	QObject::connect(mapperReloadImage, SIGNAL(mapped(int)), this, SLOT(reloadImage(int)));
	mapperReloadImage->setMapping(ui.backgroundRefresh, IM_BACKGROUND);
	QObject::connect(ui.backgroundRefresh, SIGNAL(clicked()), mapperReloadImage, SLOT(map()));
	mapperReloadImage->setMapping(ui.renderRefresh, IM_RENDER);
	QObject::connect(ui.renderRefresh, SIGNAL(clicked()), mapperReloadImage, SLOT(map()));
	mapperReloadImage->setMapping(ui.emptyRefresh, IM_EMPTY);
	QObject::connect(ui.emptyRefresh, SIGNAL(clicked()), mapperReloadImage, SLOT(map()));
	mapperReloadImage->setMapping(ui.maskRefresh, IM_MASK);
	QObject::connect(ui.maskRefresh, SIGNAL(clicked()), mapperReloadImage, SLOT(map()));
	
	//Open all compositing files
	QObject::connect(ui.actionOpen_all, SIGNAL(triggered()), this, SLOT(openAll()));

	//Save composite
	QObject::connect(ui.actionSave, SIGNAL(triggered()), this, SLOT(save()));
	QObject::connect(ui.actionSave_as, SIGNAL(triggered()), this, SLOT(saveAs()));

	//Parameter callbacks
	QObject::connect(ui.ipSlider, SIGNAL(valueChanged(int)), this, SLOT(ipSliderUpdate(int)));
	QObject::connect(ui.ipSpinBox, SIGNAL(valueChanged(double)), this, SLOT(ipSpinBoxUpdate(double)));
	QObject::connect(ui.mgSlider, SIGNAL(valueChanged(int)), this, SLOT(mgSliderUpdate(int)));
	QObject::connect(ui.mgSpinBox, SIGNAL(valueChanged(double)), this, SLOT(mgSpinBoxUpdate(double)));
	
	//Write render files (render, emtpy, mask)
	QObject::connect(ui.actionWrite_render_files, SIGNAL(triggered()), this, SLOT(writeRenderFiles()));
	
	//Display help/about
	QObject::connect(ui.actionOnline_help, SIGNAL(triggered()), this, SLOT(showOnlineHelp()));
	QObject::connect(ui.actionAbout, SIGNAL(triggered()), this, SLOT(showAbout()));
}

Compositor::~Compositor() {
	delete mapperLoadImage;
	delete mapperReloadImage;
	delete[] compositebits;
	delete settings;
}

void Compositor::loadImage(int t) {
	QString fileName = QFileDialog::getOpenFileName(this, tr("Open File"), 
		QDir::currentPath(), tr("Images (*.bmp *.gif *.jpg *.jpeg *.png *.pbm *.pgm *.ppm *.tiff *.xbm *.xpm)"));
    if (!fileName.isEmpty()) {
        QImage image(fileName);
        if (image.isNull()) {
            QMessageBox::information(this, tr("Compositor"), tr("Cannot load %1.").arg(fileName));
            return;
        }
		switch(t) {
			case IM_BACKGROUND:	
				background = image; 
				ui.backgroundPath->setPlainText(fileName);
				delete[] compositebits;
				compositebits = new uchar[image.byteCount()];
				break;
			case IM_RENDER:		render = image;		ui.renderPath->setPlainText(fileName); break;
			case IM_EMPTY:		empty = image;		ui.emptyPath->setPlainText(fileName); break;
			case IM_MASK:		mask = image;		ui.maskPath->setPlainText(fileName); break;
		}
		updateComposite();
		updateComposite(); //?? Takes 2 to update?
	}
}

void Compositor::reloadImage(int t) {
	QString fileName;
	switch(t) {
		case IM_BACKGROUND:	fileName = ui.backgroundPath->toPlainText(); break;
		case IM_RENDER:		fileName = ui.renderPath->toPlainText(); break;
		case IM_EMPTY:		fileName = ui.emptyPath->toPlainText(); break;
		case IM_MASK:		fileName = ui.maskPath->toPlainText(); break;
	}
	if (!fileName.isEmpty()) {
        QImage image(fileName);
        if (image.isNull()) {
            QMessageBox::information(this, tr("Compositor"), tr("Cannot load %1.").arg(fileName));
            return;
        }
		switch(t) {
			case IM_BACKGROUND:	
				background = image; 
				delete[] compositebits;
				compositebits = new uchar[image.byteCount()];
				break;
			case IM_RENDER:		render = image;		break;
			case IM_EMPTY:		empty = image;		break;
			case IM_MASK:		mask = image;		break;
		}
		updateComposite();
	}
}

void Compositor::resizeEvent(QResizeEvent *re) {
	updateView();
}

void Compositor::openAll() {
	QString dirName = QFileDialog::getExistingDirectory(this, tr("Choose Directory"), QDir::currentPath());
    if (!dirName.isEmpty()) {
		ui.backgroundPath->setPlainText(dirName + QString("/background.png"));
		reloadImage(IM_BACKGROUND);
		ui.renderPath->setPlainText(dirName + QString("/render.png"));
		reloadImage(IM_RENDER);
		ui.emptyPath->setPlainText(dirName + QString("/empty.png"));
		reloadImage(IM_EMPTY);
		ui.maskPath->setPlainText(dirName + QString("/mask.png"));
		reloadImage(IM_MASK);
		updateComposite();
	}
}

void Compositor::save() {
	if(saveFileName.isEmpty())
		saveAs();
	else 
		composite.save(saveFileName);
}

void Compositor::saveAs() {
	QString fileName = QFileDialog::getSaveFileName(this, tr("Save Composite"), 
		QDir::currentPath(), tr("Images (*.bmp *.gif *.jpg *.jpeg *.png *.pbm *.pgm *.ppm *.tiff *.xbm *.xpm)"));
	if(!fileName.isEmpty()) {
		saveFileName = fileName;
		composite.save(saveFileName);
	}
}

inline qreal clamp(qreal x, qreal mn = 0, qreal mx = 1) {
	qreal y = (x < mx ? x : mx);
	return (y > mn ? y : mn);
}

void Compositor::updateComposite() {
	ui.imageLabel->clear(); //Clear label contents
	//Make sure composite image dimensions match
	if(background.width()==0 || render.width()==0 || empty.width()==0 || mask.width()==0) {
		return;
	}
	if( background.width()!=mask.width() || render.width()!=mask.width() || empty.width()!=mask.width() ||
		background.height()!=mask.height() || render.height()!=mask.height() || empty.height()!=mask.height() ) {
		ui.imageLabel->setText("Loaded image dimensions do not match");
		return;
	}
	//Composte images
	uchar *B = background.bits();
	uchar *R = render.bits();
	uchar *E = empty.bits();
	uchar *M = mask.bits();
	qreal ip = ui.ipSpinBox->value(), mg = ui.mgSpinBox->value();
	for(int i=0; i<composite.byteCount(); i++) {
		qreal m = qreal(M[i])/255.0;
		if(mg!=1 && m > 0 && m < 1)
			m = pow(m, mg);
		qreal c = m*qreal(R[i]) + (1.0-m)*(qreal(B[i])+ip*(qreal(R[i])-qreal(E[i])));
		compositebits[i] = uchar(clamp(c,0,255));
	}
	composite = QImage(compositebits, background.width(), background.height(), background.format());
	updateView();
}

void Compositor::updateView() {
	if(composite.width() == 0 || composite.height() == 0)
		return;
	QImage scaledComposite;
	double label_w = double(ui.imageLabel->size().width());
	double label_h = double(ui.imageLabel->size().height());
	if(label_w/label_h > double(composite.width())/double(composite.height())) {
		if(ui.imageLabel->size().height() >= composite.height())
			scaledComposite = composite;
		else
			scaledComposite = composite.scaledToHeight(ui.imageLabel->size().height());
	} else {
		if(ui.imageLabel->size().width() >= composite.width())
			scaledComposite = composite;
		else
			scaledComposite = composite.scaledToWidth(ui.imageLabel->size().width());
	}
	ui.imageLabel->setPixmap(QPixmap::fromImage(scaledComposite));
	this->repaint();
}

void Compositor::ipSliderUpdate(int v) {
	ui.ipSpinBox->setValue( double(v)/100.0 );
}
	
void Compositor::ipSpinBoxUpdate(double v) {
	ui.ipSlider->setValue( int(v*100) );
	updateComposite();
}

void Compositor::mgSliderUpdate(int v) {
	ui.mgSpinBox->setValue( double(v)/100.0 );
}
void Compositor::mgSpinBoxUpdate(double v) {
	ui.mgSlider->setValue( int(v*100) );
	updateComposite();
}

void Compositor::writeRenderFiles() {
	QResource open_qrc("Compositor/icons/open.png");

	QDialog rfWidget(this, Qt::WindowTitleHint|Qt::WindowSystemMenuHint);
	int h = 200, w = 300;
	rfWidget.setGeometry(this->x()+(this->width()-w)/2, this->y()+(this->height()-h)/2, w, h);
	rfWidget.setMinimumSize(rfWidget.size());
	rfWidget.setMaximumSize(rfWidget.size());

	QLabel blendpathLabel("Blender binary/exe/app:", &rfWidget); 
	blendpathLabel.setGeometry(10,10,200,16);
	QPushButton blendpathButton(QIcon(open_qrc.absoluteFilePath()), QString(), &rfWidget);
	blendpathButton.setFlat(true);
	blendpathButton.setGeometry(10,30,23,23);
	blendpathButton.setIconSize(QSize(20,20));
	QPlainTextEdit blendpathText(settings->value("blender_path").toString(), &rfWidget);
	blendpathText.setGeometry(33,32,247,21);
	blendpathText.setVerticalScrollBarPolicy(Qt::ScrollBarAlwaysOff);
	blendpathText.setHorizontalScrollBarPolicy(Qt::ScrollBarAlwaysOff);
	blendpathText.setFrameShape(QFrame::Box);
	blendpathText.setFrameShadow(QFrame::Sunken);
	blendpathText.setLineWrapMode(QPlainTextEdit::NoWrap);
	blendpathText.setObjectName("blendpathText");
	
	QLabel blendfileLabel("Blend file:", &rfWidget); 
	blendfileLabel.setGeometry(10,60,200,16);
	QPushButton blendfileButton(QIcon(open_qrc.absoluteFilePath()), QString(), &rfWidget);
	blendfileButton.setFlat(true);
	blendfileButton.setGeometry(10,80,23,23);
	blendfileButton.setIconSize(QSize(20,20));
	QPlainTextEdit blendfileText(QString(), &rfWidget);
	blendfileText.setGeometry(33,82,247,21);
	blendfileText.setVerticalScrollBarPolicy(Qt::ScrollBarAlwaysOff);
	blendfileText.setHorizontalScrollBarPolicy(Qt::ScrollBarAlwaysOff);
	blendfileText.setFrameShape(QFrame::Box);
	blendfileText.setFrameShadow(QFrame::Sunken);
	blendfileText.setLineWrapMode(QPlainTextEdit::NoWrap);
	blendfileText.setObjectName("blendfileText");
	
	QSignalMapper mapperLoadPaths(this);
	QObject::connect(&mapperLoadPaths, SIGNAL(mapped(QObject*)), this, SLOT(loadPath(QObject*)));
	mapperLoadPaths.setMapping(&blendpathButton, (QObject*)&blendpathText);
	QObject::connect(&blendpathButton, SIGNAL(clicked()), &mapperLoadPaths, SLOT(map()));
	mapperLoadPaths.setMapping(&blendfileButton, (QObject*)&blendfileText);
	QObject::connect(&blendfileButton, SIGNAL(clicked()), &mapperLoadPaths, SLOT(map()));

	QLabel objectsLabel("Inserted object names:", &rfWidget); 
	objectsLabel.setGeometry(10,110,200,16);
	QPlainTextEdit objectsText(QString(), &rfWidget);
	objectsText.setGeometry(33,132,247,21);
	objectsText.setVerticalScrollBarPolicy(Qt::ScrollBarAlwaysOff);
	objectsText.setHorizontalScrollBarPolicy(Qt::ScrollBarAlwaysOff);
	objectsText.setFrameShape(QFrame::Box);
	objectsText.setFrameShadow(QFrame::Sunken);
	objectsText.setLineWrapMode(QPlainTextEdit::NoWrap);

	QPushButton okButton("Write files", &rfWidget);
	okButton.setGeometry(90,165,90,25);
	QSignalMapper mapperFinishDialogWrite(this);
	QObject::connect(&mapperFinishDialogWrite, SIGNAL(mapped(QObject*)), this, SLOT(finishDialogWrite(QObject*)));
	mapperFinishDialogWrite.setMapping(&okButton, (QObject*)&rfWidget);
	QObject::connect(&okButton, SIGNAL(clicked()), &mapperFinishDialogWrite, SLOT(map()));

	QPushButton cancelButton("Cancel", &rfWidget);
	cancelButton.setGeometry(190,165,90,25);
	QSignalMapper mapperFinishDialogCancel(this);
	QObject::connect(&mapperFinishDialogCancel, SIGNAL(mapped(QObject*)), this, SLOT(finishDialogCancel(QObject*)));
	mapperFinishDialogCancel.setMapping(&cancelButton, (QObject*)&rfWidget);
	QObject::connect(&cancelButton, SIGNAL(clicked()), &mapperFinishDialogCancel, SLOT(map()));

	if(rfWidget.exec() == QDialog::Accepted) { //Choosen to write files
		//Convert object names to string array (split at any non-letter/numbers)
		QString objArray = QString("['") + objectsText.toPlainText().split(QRegExp("\\s*(,|\\s)\\s*")).join("','") + QString("']");

		//Directory of specified .blend file
		QDir blendDir = QFileInfo(blendfileText.toPlainText()).dir();

		//Write/run render file script
		QResource wrf_qrc("Compositor/scripts/writeRenderFiles.py");
		QFile wrf_file(wrf_qrc.absoluteFilePath());
		wrf_file.open(QIODevice::ReadOnly | QIODevice::Text);
		QTextStream wrf_stream(&wrf_file);
		QString wrf_py = wrf_stream.readAll();
		wrf_py.replace("OBJ_NAMES_PLACEHOLDER", objArray);
		QString wrf_out_filename = blendDir.absolutePath().append(QString("/writeRenderFiles.py"));
		QFile wrf_out_file(wrf_out_filename);
		wrf_out_file.open(QIODevice::WriteOnly | QIODevice::Text);
		QTextStream wrf_out(&wrf_out_file);
		wrf_out << wrf_py;
		wrf_out_file.close();
		QStringList wrf_args;
		wrf_args << "-b" << blendfileText.toPlainText() << "-P" << wrf_out_filename;
		qDebug() << blendpathText.toPlainText() + " " + wrf_args.join(" ");
		QProcess wrf_run;
		wrf_run.execute(blendpathText.toPlainText(), wrf_args);

		//Write/run mask script
		QResource gom_qrc("Compositor/scripts/getObjectMask.py");
		QFile gom_file(gom_qrc.absoluteFilePath());
		gom_file.open(QIODevice::ReadOnly | QIODevice::Text);
		QTextStream gom_stream(&gom_file);
		QString gom_py = gom_stream.readAll();
		gom_py.replace("OBJ_NAMES_PLACEHOLDER", objArray);
		QString gom_out_filename = blendDir.absolutePath().append(QString("/getObjectMask.py"));
		QFile gom_out_file(gom_out_filename);
		gom_out_file.open(QIODevice::WriteOnly | QIODevice::Text);
		QTextStream gom_out(&gom_out_file);
		gom_out << gom_py;
		gom_out_file.close();
		QStringList gom_args;
		gom_args << "-b" << blendfileText.toPlainText() << "-P" << gom_out_filename;
		qDebug() << blendpathText.toPlainText() + " " + gom_args.join(" ");
		QProcess gom_run;
		gom_run.execute(blendpathText.toPlainText(), gom_args);
	}
}

void Compositor::loadPath(QObject* qo) {
	QPlainTextEdit* qpte = (QPlainTextEdit*)qo;
	QString title, filter;
	if( qpte->objectName().compare(QString("blendpathText"))==0 ) {
		title = tr("Locate Blender executable");
	} else if( qpte->objectName().compare(QString("blendfileText"))==0 ) {
		title = tr("Choose blender scene");
		filter = tr("Blend files (*.blend)");
	}
	QString fileName = QFileDialog::getOpenFileName(this, title, QDir::currentPath(), filter);
    if(!fileName.isEmpty()) {
		if( ! QFileInfo(fileName).bundleName().isEmpty() ) //implies Mac OSX .app
			fileName = fileName.append("/Contents/MacOS/blender");
		qpte->setPlainText(fileName);
		if( qpte->objectName().compare(QString("blendpathText"))==0 )
			settings->setValue("blender_path", fileName);
	}
}

void Compositor::finishDialogWrite(QObject* qo) { ((QDialog*)qo)->accept(); }
void Compositor::finishDialogCancel(QObject* qo) { ((QDialog*)qo)->reject(); }

void Compositor::showOnlineHelp() {
	bool opened = QDesktopServices::openUrl(QUrl("http://kevinkarsch.com/rsolp/composite/index.html", QUrl::TolerantMode));
	if(!opened) {
		QMessageBox msgBox;
		msgBox.setText("Could not find a browser to open. \nPlease visit http://kevinkarsch.com/rsolp/composite/index.html.");
		msgBox.exec();
	}	
}
void Compositor::showAbout() {
	QMessageBox::about(this, "About", "RSOLP Compositor Beta v0.1\nAuthor: Kevin Karsch, 2012");
}
