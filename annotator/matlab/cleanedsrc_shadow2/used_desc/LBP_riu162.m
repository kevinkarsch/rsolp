function hst = LBP_riu162(X)

%Returns a rotation invariant LBP (uniform patterns) histogram of picture X.
%number of pixels = 16  => 18 bins
%predicate =2
%
%size of picture X must be at least 5X5 pixels

w1 = (cos(pi/8)*2-1)*(sin(pi/8)*2);
w2 = (cos(pi/8)*2-1)*(1-sin(pi/8)*2);
w3 = (2-cos(pi/8)*2)*(sin(pi/8)*2);
w4 = (2-cos(pi/8)*2)*(1-sin(pi/8)*2);

w5 = (cos(pi/4)*2-1)*(sin(pi/4)*2-1);
w6 = (2-cos(pi/4)*2)*(sin(pi/4)*2-1);
w7 = (2-cos(pi/4)*2)*(2-sin(pi/4)*2);

D = size(X);
sx = D(2); 
sy = D(1);

p1 = zeros(sy+4,sx+4);p2 = zeros(sy+4,sx+4);p3 = zeros(sy+4,sx+4);
p4 = zeros(sy+4,sx+4);p5 = zeros(sy+4,sx+4);p6 = zeros(sy+4,sx+4);
p7 = zeros(sy+4,sx+4);p8 = zeros(sy+4,sx+4);p9 = zeros(sy+4,sx+4);
p10 = zeros(sy+4,sx+4);
pc = zeros(sy+4,sx+4);

pc(3:sy+2,3:sx+2) = X ;

%upper left corner
p1(5:sy+4,5:sx+4) = X ;
p2(5:sy+4,4:sx+3) = X ;
p3(4:sy+3,5:sx+4) = X ;
p4(4:sy+3,4:sx+3) = X ;

p5(5:sy+4,3:sx+2) = X ;
p6(4:sy+3,3:sx+2) = X ;

p7(3:sy+2,5:sx+4) = X ;
p8(3:sy+2,4:sx+3) = X ;

Xi1 = p7 >=pc; %Xi1 to the left from center
Xi2 = (w1*p3+ w3*p4 + w2*p7 + w4*p8 + 0.00001)>=pc ; 
tmp2 = (Xi1~=Xi2);
Xi3 = (w5*p1+ w6*(p2 + p3) + w7*p4 + 0.00001)>=pc ; 
Xi = Xi1 + Xi2 + Xi3;
tmp2 = tmp2 + (Xi2~=Xi3);
Xi2 = (w1*p2+ w3*p4 + w2*p5 + w4*p6 + 0.00001)>=pc ;
Xi = Xi + Xi2;
tmp2 = tmp2 + (Xi2~=Xi3);

%upper right corner
p1(5:sy+4,2:sx+1) = X ;
p2(5:sy+4,1:sx) = X ;
p3(4:sy+3,2:sx+1) = X ;
p4(4:sy+3,1:sx) = X ;

p9(3:sy+2,2:sx+1) = X ;
p10(3:sy+2,1:sx) = X ;

Xi3 = p5 >= pc; %Xi5 up from center
Xi = Xi + Xi3;
tmp2 = tmp2 + (Xi2~=Xi3);
Xi2 = (w1*p1+ w3*p3 + w2*p5 + w4*p6 + 0.00001)>=pc ; 
Xi = Xi + Xi2;
tmp2 = tmp2 + (Xi2~=Xi3);
Xi3 = (w5*p2+ w6*(p1 + p4) + w7*p3 + 0.00001)>=pc ; 
Xi = Xi + Xi3;
tmp2 = tmp2 + (Xi2~=Xi3);
Xi2 = (w1*p4+ w3*p3 + w2*p10 + w4*p9 + 0.00001)>=pc ;
Xi = Xi + Xi2;
tmp2 = tmp2 + (Xi2~=Xi3);

%lower right corner
p1(2:sy+1,2:sx+1) = X ;
p2(2:sy+1,1:sx) = X ;
p3(1:sy,2:sx+1) = X ;
p4(1:sy,1:sx) = X ;

p5(2:sy+1,3:sx+2) = X ;
p6(1:sy,3:sx+2) = X ;

Xi3 = (p10>=pc); %Xi5 to the right from center
Xi = Xi + Xi3;
tmp2 = tmp2 + (Xi2~=Xi3);
Xi2 = (w1*p2+ w3*p1 + w2*p10 + w4*p9 + 0.00001)>=pc ; 
Xi = Xi + Xi2;
tmp2 = tmp2 + (Xi2~=Xi3);
Xi3 = (w5*p4+ w6*(p2 + p3) + w7*p1 + 0.00001)>=pc ; 
Xi = Xi + Xi3;
tmp2 = tmp2 + (Xi2~=Xi3);
Xi2 = (w1*p3+ w3*p1 + w2*p6 + w4*p5 + 0.00001)>=pc ;
Xi = Xi + Xi2;
tmp2 = tmp2 + (Xi2~=Xi3);

%lower left corner
p1(2:sy+1,5:sx+4) = X ;
p2(2:sy+1,4:sx+3) = X ;
p3(1:sy,5:sx+4) = X ;
p4(1:sy,4:sx+3) = X ;

Xi3 = p6>=pc; %Xi5 down from center
Xi = Xi + Xi3;
tmp2 = tmp2 + (Xi2~=Xi3);
Xi2 = (w1*p4+ w3*p2 + w2*p6 + w4*p5 + 0.00001)>=pc ; 
Xi = Xi + Xi2;
tmp2 = tmp2 + (Xi2~=Xi3);
Xi3 = (w5*p3+ w6*(p1 + p4) + w7*p2 + 0.00001)>=pc ; 
Xi = Xi + Xi3;
tmp2 = tmp2 + (Xi2~=Xi3);
Xi2 = (w1*p1+ w3*p2 + w2*p7 + w4*p8 + 0.00001)>=pc ;
Xi = Xi + Xi2;
tmp2 = tmp2 + (Xi2~=Xi3)+ (Xi2~=Xi1);


Xi(tmp2>2)=17;

X=Xi(5:sy,5:sx);

hst=sum(hist(X,0:17)');

