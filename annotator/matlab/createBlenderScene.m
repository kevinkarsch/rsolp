function scene = createBlenderScene( imgfile, annotationfile, out_dir )
BLENDER_BIN = '/srv/rsolp/rsolp/src/blender/blender-2.58a-linux-glibc27-x86_64/blender';
%BLENDER_BIN = '/Applications/Blender/blender.app/Contents/MacOS/blender';

if(nargin==1)
    [path,file,ext] = fileparts(imgfile);
    imgfile = fullfile(path,file,[file '.png']);
    annotationfile = fullfile(path,file,'annotations.txt');
    out_dir = fullfile(path,file,'out');
end
img = imread(imgfile);

%Get the scene from the annotations
fprintf('Computing 3D scene and materials...');
tic;
scene = getScene(imgfile, annotationfile);
fprintf('done! (%5.2f)\n', toc);

%Optimize lighting params (requires blender+luxrender)
fprintf('Optimizing lighting parameters...');
tic;

%scene = optimizeLightParams(scene, BLENDER_BIN);
if( numel(scene.lights3d)>0 )
    try
        scene = optimizeLightParams(scene, BLENDER_BIN);
    catch
        fprintf('Error during optimization...');
    end
end
fprintf('done! (%5.2f)\n', toc);

%Export to blender25 .py and create the scene
fprintf('Exporting to Blender...');
tic;
blender25Export(scene, out_dir, BLENDER_BIN);
fprintf('done! (%5.2f)\n', toc);
fprintf('\n');

%Write empty luxrender scene file
renderparams.h = size(img,1);
renderparams.w = size(img,2);
renderparams.halt_spp = 500;
renderparams.outpath = '//';
renderLuxblend(fullfile(out_dir, [scene.name, '.blend']), BLENDER_BIN, renderparams, false);
