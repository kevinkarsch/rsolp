#ifndef COMPOSITER_H
#define COMPOSITER_H

#include <QtGui/QMainWindow>
#include "ui_compositor.h"
#include <QSignalMapper>
#include <QSettings>
#include "timer.h"

class Compositor : public QMainWindow
{
	Q_OBJECT

	enum IMAGE_TYPE { IM_BACKGROUND, IM_RENDER, IM_EMPTY, IM_MASK };

public:
	Compositor(QWidget *parent = 0, Qt::WFlags flags = 0);
	~Compositor();

public slots:
	void loadImage(int t);
	void reloadImage(int t);
	void openAll();
	void save();
	void saveAs();
	void ipSliderUpdate(int v);
	void ipSpinBoxUpdate(double v);
	void mgSliderUpdate(int v);
	void mgSpinBoxUpdate(double v);
	void writeRenderFiles();
	void loadPath(QObject* qo);
	void finishDialogWrite(QObject* qo);
	void finishDialogCancel(QObject* qo);
	void showOnlineHelp();
	void showAbout();

protected:
	void resizeEvent(QResizeEvent *re);

private:
	Ui::CompositorClass ui;
	QSignalMapper *mapperLoadImage, *mapperReloadImage;
	QImage composite, background, render, empty, mask;
	uchar *compositebits;
	QString saveFileName;
	void updateComposite();
	void updateView();
	QSettings *settings;
};

#endif // COMPOSITER_H
