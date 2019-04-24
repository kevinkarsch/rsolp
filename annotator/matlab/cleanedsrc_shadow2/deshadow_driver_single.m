function deshadow_driver_single(fnlist)

%addpath('meanshift');
%addpath('used_desc');
%addpath('svmlight_mex');
%addpath('utils');
%addpath(genpath('UGM'));

opt = {};
opt.dir = 'data/';
% fnlist = {'danceroom.jpg', 'siebel.bmp', 'chapel.png', 'corridor.png', 'glasshallway.png', 'pikachuroom.png', 'snow1.png', 'snow2.png'};
% fnlist={'pikachuroom_floor.png','pikachuroom_left.png','pikachuroom_floorcropped.png'};
for i=1:length(fnlist)
    opt.fn = fnlist{i};
    opt.save = 1;
    opt.binaryClassifier = 'models/model_pair.mat';
    opt.unaryClassifier = 'models/unary_model_our.mat';
    opt.resize = 0;
    opt.adjecent = 0;
    opt.pairwiseonly = 0;
    opt.linearize = 1;
    h = findshadowcut_cross(opt);
    

end

