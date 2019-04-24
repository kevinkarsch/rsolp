function out = LBP_riu243_img(X)

%Returns rotation invariant (uniform patterns) LBP values of picture X. 
%Number of interpolated pixels = 24 -> 26 possible values
%Predicate = 3.
%
%the size of X must be at least 7X7 pixels

w1 = (cos(pi/12)*3-2)*(sin(pi/12)*3);
w2 = (3-cos(pi/12)*3)*(sin(pi/12)*3);
w3 = (cos(pi/12)*3-2)*(1-sin(pi/12)*3);
w4 = (3-cos(pi/12)*3)*(1-sin(pi/12)*3);

w5 = (cos(pi/6)*3-2)/2;
w6 = (3-cos(pi/6)*3)/2;

w7 = (3-cos(pi/8)*3)^2;
w8 = (cos(pi/8)*3-2)*(3-cos(pi/8)*3);
w9 = (cos(pi/8)*3-2)^2;

D = size(X);
sy=D(1);
sx=D(2);

Xi = zeros(sy+6,sx+6);

p1 = zeros(sy+6,sx+6);p2 = zeros(sy+6,sx+6);p3 = zeros(sy+6,sx+6);
p4 = zeros(sy+6,sx+6);p5 = zeros(sy+6,sx+6);p6 = zeros(sy+6,sx+6);
p7 = zeros(sy+6,sx+6);p8 = zeros(sy+6,sx+6);

pc = zeros(sy+6,sx+6);

pc(4:sy+3,4:sx+3) = X ;

%left 
p5(4:sy+3,7:sx+6) = X ;
p6(4:sy+3,6:sx+5) = X ;

p1(5:sy+4,7:sx+6) = X ;
p2(5:sy+4,6:sx+5) = X ;

Xi1 = p5 >=pc; %Xi1 to the left from center
Xi2 = (w1*p1+ w2*p2 + w3*p5 + w4*p6)>=pc ; 
tmp2 = (Xi1~=Xi2);

p3(6:sy+5,7:sx+6) = X ;
p4(6:sy+5,6:sx+5) = X ;

Xi3 = (w5*(p1+p3) + w6*(p2+p4)) >= pc ; 
Xi = Xi1 + Xi2 + Xi3;
tmp2 = tmp2 + (Xi2~=Xi3);

p1(7:sy+6,7:sx+6) = X ;
p2(7:sy+6,6:sx+5) = X ;

Xi2 = (w7*p1 + w8*(p2+p3) + w9*p4) >= pc ;
Xi = Xi + Xi2;
tmp2 = tmp2 + (Xi2~=Xi3);

p1(7:sy+6,5:sx+4) = X ;
p3(6:sy+5,5:sx+4) = X ;

Xi3 = (w5*(p1+p2) + w6*(p3+p4)) >= pc ;
Xi = Xi + Xi3;
tmp2 = tmp2 + (Xi2~=Xi3);

p2(7:sy+6,4:sx+3) = X ;
p4(6:sy+5,4:sx+3) = X ;

Xi2 = (w1*p1 + w2*p3 + w3*p2 + w4*p4) >= pc ;
Xi = Xi + Xi2;
tmp2 = tmp2 + (Xi2~=Xi3);
Xi3 = p2 >= pc ; %up
Xi = Xi + Xi3;
tmp2 = tmp2 + (Xi2~=Xi3);

p1(7:sy+6,3:sx+2) = X ;
p3(6:sy+5,3:sx+2) = X ;

Xi2 = (w1*p1 + w2*p3 + w3*p2 + w4*p4) >= pc ;
Xi = Xi + Xi2;
tmp2 = tmp2 + (Xi2~=Xi3);

p2(7:sy+6,2:sx+1) = X ;
p4(6:sy+5,2:sx+1) = X ;

Xi3 = (w5*(p1+p2) + w6*(p3+p4)) >= pc ;
Xi = Xi + Xi3;
tmp2 = tmp2 + (Xi2~=Xi3);

p1(7:sy+6,1:sx) = X ;
p3(6:sy+5,1:sx) = X ;

Xi2 = (w7*p1 + w8*(p3+p2) + w9*p4) >= pc ;
Xi = Xi + Xi2;
tmp2 = tmp2 + (Xi2~=Xi3);

p1(5:sy+4,2:sx+1) = X ;
p2(5:sy+4,1:sx) = X ;

Xi3 = (w5*(p2+p3) + w6*(p1+p4)) >= pc ;
Xi = Xi + Xi3;
tmp2 = tmp2 + (Xi2~=Xi3);

p3(4:sy+3,2:sx+1) = X ;
p4(4:sy+3,1:sx) = X ;

Xi2 = (w1*p2 + w2*p1 + w3*p4 + w4*p3) >= pc ;
Xi = Xi + Xi2;
tmp2 = tmp2 + (Xi2~=Xi3);
Xi3 = p4 >= pc ; %right
Xi = Xi + Xi3;
tmp2 = tmp2 + (Xi2~=Xi3);

p1(3:sy+2,2:sx+1) = X ;
p2(3:sy+2,1:sx) = X ;

Xi2 = (w1*p2 + w2*p1 + w3*p4 + w4*p3) >= pc ;
Xi = Xi + Xi2;
tmp2 = tmp2 + (Xi2~=Xi3);

p3(2:sy+1,2:sx+1) = X ;
p4(2:sy+1,1:sx) = X ;

Xi3 = (w5*(p2+p4) + w6*(p1+p3)) >= pc ;
Xi = Xi + Xi3;
tmp2 = tmp2 + (Xi2~=Xi3);

p1(1:sy,2:sx+1) = X ;
p2(1:sy,1:sx) = X ;

Xi2 = (w7*p2 + w8*(p1+p4) + w9*p3) >= pc ;
Xi = Xi + Xi2;
tmp2 = tmp2 + (Xi2~=Xi3);

p4(2:sy+1,3:sx+2) = X ;
p2(1:sy,3:sx+2) = X ;

Xi3 = (w5*(p2+p1) + w6*(p3+p4)) >= pc ;
Xi = Xi + Xi3;
tmp2 = tmp2 + (Xi2~=Xi3);

p3(2:sy+1,4:sx+3) = X ;
p1(1:sy,4:sx+3) = X ;

Xi2 = (w1*p2 + w2*p4 + w3*p1 + w4*p3) >= pc ;
Xi = Xi + Xi2;
tmp2 = tmp2 + (Xi2~=Xi3);
Xi3 = p1 >= pc; %down
Xi = Xi + Xi3;
tmp2 = tmp2 + (Xi2~=Xi3);

p4(2:sy+1,5:sx+4) = X ;
p2(1:sy,5:sx+4) = X ; 

Xi2 = (w1*p2 + w2*p4 + w3*p1 + w4*p3) >= pc ;
Xi = Xi + Xi2;
tmp2 = tmp2 + (Xi2~=Xi3);

p3(2:sy+1,6:sx+5) = X ;
p1(1:sy,6:sx+5) = X ; 

Xi3 = (w5*(p2+p1) + w6*(p4+p3)) >= pc ;
Xi = Xi + Xi3;
tmp2 = tmp2 + (Xi2~=Xi3);

p4(2:sy+1,7:sx+6) = X ;
p2(1:sy,7:sx+6) = X ; 

Xi2 = (w7*p2 + w8*(p4+p1) + w9*p3) >= pc ;
Xi = Xi + Xi2;
tmp2 = tmp2 + (Xi2~=Xi3);

p1(3:sy+2,7:sx+6) = X ;
p2(3:sy+2,6:sx+5) = X ; 

Xi3 = (w5*(p4+p1) + w6*(p2+p3)) >= pc ;
Xi = Xi + Xi3;
tmp2 = tmp2 + (Xi2~=Xi3);
Xi2 = (w1*p1+ w2*p2 + w3*p5 + w4*p6)>=pc ; 
Xi = Xi + Xi2;
tmp2 = tmp2 + (Xi2~=Xi3) + (Xi2~=Xi1);


Xi(tmp2>2)=25;
out=Xi(7:sy,7:sx);
