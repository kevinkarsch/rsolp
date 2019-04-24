function runMatting(fnlist)


%addpath('matting');
%addpath('utils');

if (~exist('thr_alpha','var'))
 thr_alpha=[];
end
if (~exist('epsilon','var'))
 epsilon=[];
end
if (~exist('win_size','var'))
 win_size=[];
end

if (~exist('levels_num','var'))
 levels_num=1;
end
if (~exist('active_levels_num','var'))
 active_levels_num=1;
end

% fnlist = {'danceroom.jpg', 'chapel.png', 'corridor.png', 'glasshallway.png', 'pikachuroom.png', 'snow1.png', 'snow2.png'};
% fnlist={'pikachuroom_floorcropped.png'};

for i =1:length(fnlist)  
    fprintf('processing %d out of %d\n', i, numel(fnlist));   
    
    fn = fnlist{i};
    
    pos = find(fn == '.');
    
    img_name = ['data/original/' fn];
    
    hardmap_name = ['data/binary/' fn(1:pos-1) '_binary.png' ];
    softmap_name = ['data/matting/' fn(1:pos-1) '_soft.png'];

    img=imread(img_name);

    I=im2double(img);
 
    hard_map=imread(hardmap_name);
    
    hard_map = im2double(hard_map); 
    
    hard_map_1=conv2(hard_map,fspecial('average',10),'same');
    hard_map_2=conv2(hard_map,fspecial('average',10),'same');

    consts_map=hard_map_2>1-1e-8 | hard_map_1==0;

    consts_vals=hard_map_1>1 - 1e-8;
    
    cd matting; 
    alpha=solveAlpha(I,consts_map,consts_vals,epsilon,win_size);
    cd ..;

    soft_map=alpha;

    imwrite(soft_map, softmap_name, 'png');

end
