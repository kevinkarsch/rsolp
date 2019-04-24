#include "compositor.h"
#include <QtGui/QApplication>

int main(int argc, char *argv[])
{
	QApplication a(argc, argv);
	Compositor w;
	w.show();
	return a.exec();
}
