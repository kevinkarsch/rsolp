#ifndef _PCTIMER_H
#define _PCTIMER_H

#if defined(WIN32) || defined(__CYGWIN__)
#ifndef WIN32
#define PCTIMER_NO_WIN32
#endif /* WIN32 */
#define WIN32_LEAN_AND_MEAN
#include <windows.h>  // req'd for QueryPerformance[...]
#ifdef PCTIMER_NO_WIN32
#undef PCTIMER_NO_WIN32
#undef WIN32
#endif /* PCTIMER_NO_WIN32 */
__inline double getTime() {
	static LARGE_INTEGER pcount, pcfreq;
	static int initflag;
    if (!initflag) {
		QueryPerformanceFrequency(&pcfreq);
		initflag++;
	}
	QueryPerformanceCounter(&pcount);
	return (double)pcount.QuadPart / (double)pcfreq.QuadPart;
}
#else /* Not Win32/Cygwin */
#include <sys/time.h>
__inline double getTime() {
    struct timeval tv;
    gettimeofday(&tv, NULL);
    return (double)tv.tv_sec + (double)tv.tv_usec / 1000000;
}
#endif

#endif /* _PCTIMER_H */
