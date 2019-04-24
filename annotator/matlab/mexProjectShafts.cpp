#include "mex.h"
#include <stdio.h>
#include <string.h>
#include <float.h>
#include <math.h>

//Usage: alpha = mexProjectShafts(shaftimg, quadfrom, quadto, tosize, dir)

//Helpers
inline void getorigin(double *org, double ip, double jp, double *from);
inline double dot(double *a, double* b) { return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]; }
inline void solveSystem(double *A, double *b, double *x); //Solves Ax=b, A is 3x4, b is 3x1

///////////////////  Main  ////////////////////////////
void mexFunction( int nlhs, mxArray *plhs[],
                  int nrhs, const mxArray *prhs[] )
{
    //Check proper input and output
    if(nrhs!=5)
    	mexErrMsgTxt("Must have 5 input arguments");
    else if(nlhs > 6)
        mexErrMsgTxt("Too many output arguments.");
    
    //Load input
    const mwSize *dims = mxGetDimensions(prhs[0]);
    double *shaftimg = mxGetPr(prhs[0]);
    double *from = mxGetPr(prhs[1]);
    double *to = mxGetPr(prhs[2]);
    double *tosize = mxGetPr(prhs[3]);
    double *dir = mxGetPr(prhs[4]);
    
    double hfrom = dims[0];
    double wfrom = dims[1];
    double hto = tosize[0];
    double wto = tosize[1];
    
    //Create outputs
    plhs[0] = mxCreateDoubleMatrix(hto, wto, mxREAL);
    double *alpha = mxGetPr(plhs[0]);
    
    //Splat a 3x3 gaussian (sig=1) around nearest projected pixel
    double *totalCont = (double*)malloc(sizeof(double)*hto*wto);
    double kernel[9] = {0.0751, 0.1238, 0.0751,
                        0.1238, 0.2042, 0.1238,
                        0.0751, 0.1238, 0.0751};
    
    //Project shafts onto other walls
    double org[3];
    for(int i=0; i<hfrom; i++) { //height
        for(int j=0; j<wfrom; j++) { //width
            int idx = i+j*hfrom;
            if(shaftimg[idx]>0) {
                getorigin(org, i/(hfrom-1), j/(wfrom-1), from);
                double v1[3] = {to[0]-to[1], to[4]-to[5], to[8]-to[9]};
                double v2[3] = {to[0]-to[3], to[4]-to[7], to[8]-to[11]};
                double n[3] = {v1[1]*v2[2]-v1[2]*v2[1], v1[2]*v2[0]-v1[0]*v2[2], v1[0]*v2[1]-v1[1]*v2[0]};
                double magn = sqrtf(dot(n,n));
                n[0]/=magn; n[1]/=magn; n[2]/=magn;
                double D = -(n[0]*to[0] + n[1]*to[4] + n[2]*to[8]);
                double t = -(dot(n,org)+D) / dot(n,dir);
                if(t==t /*NaN check*/ && fabs(t) > 0.0001) {
                   // Solve to*x = (t*dir+org) => x = inv(to'*to)*to'*(t*dir+org)
//                     mxArray *x[1], *Ab[2];
//                     Ab[0] = mxCreateDoubleMatrix(3, 3, mxREAL);
//                     double *A = mxGetPr(Ab[0]);
//                     A[0]=to[0]; A[1]=to[4]; A[2]=to[8];
//                     A[3]=to[1]; A[4]=to[5]; A[5]=to[9];
//                     A[6]=to[2]; A[7]=to[6]; A[8]=to[10];
//                     Ab[1] = mxCreateDoubleMatrix(3, 1, mxREAL);
//                     double *b = mxGetPr(Ab[1]);
//                     b[0]=t*dir[0]+org[0]; 
//                     b[1]=t*dir[1]+org[1]; 
//                     b[2]=t*dir[2]+org[2];
//                     mexCallMATLAB(1, x, 2, Ab, "mldivide");
//                     double *xpr = mxGetPr(x[0]);
//                     printf("%f %f %f %f\n", xpr[0],xpr[1],xpr[2],xpr[3]);
                    double A[9] = {to[0],to[1],to[2], to[4],to[5],to[6], to[8],to[9],to[10]};
                    double b[3] = {t*dir[0]+org[0], t*dir[1]+org[1], t*dir[2]+org[2]};
                    double xpr[3];
                    solveSystem(A,b,xpr);
                    double uvs[2] = {xpr[0]*1 + xpr[1]*1 + xpr[2]*hto,
                                     xpr[0]*1 + xpr[1]*wto + xpr[2]*wto};
                    uvs[0] = floor(uvs[0]+0.5)-1;
                    uvs[1] = floor(uvs[1]+0.5)-1;
                    if(0<=uvs[0] && uvs[0]<=hto-1 && 0<=uvs[1] && uvs[1]<=wto-1) {
                        int z=0;
                        double v = shaftimg[idx];
                        for(int a=int(uvs[0])-1; a<=int(uvs[0])+1; a++) {
                            for(int b=int(uvs[1])-1; b<=int(uvs[1])+1; b++, z++) {
                                if(0<=a && a<hto && 0<=b && b<wto){
                                    int toidx = a+b*int(hto);
                                    alpha[toidx] += v*kernel[z];
                                    totalCont[toidx] += kernel[z];
                                }
                            }
                        }
                    }
                }
            }   
        }
    }
    //Divide by total contribution
    for(int i=0; i<hto*wto; i++)
        if(totalCont[i]>0)
            alpha[i] /= totalCont[i];
    free(totalCont);
}

void getorigin(double *org, double ip, double jp, double *from) {
    double x1[3] = {from[0]*(1-jp) + from[1]*jp, from[4]*(1-jp) + from[5]*jp, from[8]*(1-jp) + from[9]*jp};
    double x2[3] = {from[3]*(1-jp) + from[2]*jp, from[7]*(1-jp) + from[6]*jp, from[11]*(1-jp) + from[10]*jp};
    org[0] = x1[0]*(1-ip) + x2[0]*ip;
    org[1] = x1[1]*(1-ip) + x2[1]*ip;
    org[2] = x1[2]*(1-ip) + x2[2]*ip;
}

void solveSystem(double *A, double *b, double *x) {
    int z=0;
    double AtA[9]; //A'*A
    for(int i=0; i<3; i++)
        for(int j=0; j<3; j++,z++)
            AtA[z] = A[i]*A[j] + A[i+3]*A[j+3] + A[i+6]*A[j+6];
    //Closed form 3x3 inverse (for efficiency)
    double invAtA[9] = {AtA[4]*AtA[8] - AtA[5]*AtA[7], AtA[2]*AtA[7] - AtA[1]*AtA[8], AtA[1]*AtA[5] - AtA[2]*AtA[4],
                        AtA[5]*AtA[6] - AtA[3]*AtA[8], AtA[0]*AtA[8] - AtA[2]*AtA[6], AtA[2]*AtA[3] - AtA[0]*AtA[5],
                        AtA[3]*AtA[7] - AtA[4]*AtA[6], AtA[1]*AtA[6] - AtA[0]*AtA[7], AtA[0]*AtA[4] - AtA[1]*AtA[3]};
    double detAtA = AtA[0]*AtA[4]*AtA[8] - AtA[0]*AtA[5]*AtA[7] - AtA[1]*AtA[3]*AtA[8] +
                    AtA[1]*AtA[5]*AtA[6] + AtA[2]*AtA[3]*AtA[7] - AtA[2]*AtA[4]*AtA[6];
    for(int i=0; i<9; i++) invAtA[i]/=detAtA;    
    double Atb[3] = {A[0]*b[0] + A[3]*b[1] + A[6]*b[2],
                     A[1]*b[0] + A[4]*b[1] + A[7]*b[2],
                     A[2]*b[0] + A[5]*b[1] + A[8]*b[2]};
    //x = invAtA*Atb (i.e. least squares soln x=inv(A'*A)*A'*b)                 
    x[0] = invAtA[0]*Atb[0] + invAtA[1]*Atb[1] + invAtA[2]*Atb[2];
    x[1] = invAtA[3]*Atb[0] + invAtA[4]*Atb[1] + invAtA[5]*Atb[2];
    x[2] = invAtA[6]*Atb[0] + invAtA[7]*Atb[1] + invAtA[8]*Atb[2];
}
