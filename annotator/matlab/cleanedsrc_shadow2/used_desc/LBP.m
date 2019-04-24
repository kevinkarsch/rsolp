function hst = LBP(X)

%Returns LBP histogram (256 bins) of picture X.
%
%             1  2   4
% weights = 128  0   8
%            64 32  16
%
%the size of X must be at least 3x3 pixels


D = size(X);
sx = D(2);
sy = D(1);

Xi = zeros(sy+2,sx+2);
Xi(2:sy+1,2:sx+1) = X;

Xi1 = zeros(sy+2,sx+2);Xi2 = zeros(sy+2,sx+2);Xi3 = zeros(sy+2,sx+2);Xi4= zeros(sy+2,sx+2);
Xi5 = zeros(sy+2,sx+2);Xi6 = zeros(sy+2,sx+2);Xi7 = zeros(sy+2,sx+2);Xi8 = zeros(sy+2,sx+2);

Xi1(3:sy+2,3:sx+2) = X;
Xi2(3:sy+2,2:sx+1) = X;
Xi3(3:sy+2,1:sx) = X;
Xi4(2:sy+1,1:sx) = X;
Xi5(1:sy,1:sx) = X;
Xi6(1:sy,2:sx+1) = X;
Xi7(1:sy,3:sx+2) = X;
Xi8(2:sy+1,3:sx+2) = X;

Xi= (Xi1>=Xi)+2*(Xi2>=Xi)+4*(Xi3>=Xi)+8*(Xi4>=Xi)+16*(Xi5>=Xi)+32*(Xi6>=Xi)+64*(Xi7>=Xi)+128*(Xi8>=Xi);

X=Xi(3:sy,3:sx);

hst=sum(hist(X,0:255)');

