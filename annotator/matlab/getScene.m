% COORDINATE SYSTEMS:                        
% (Object space)        (Image space)     (Blender)
%     y   z              o------ x         y
%     |  /               |                 |
%     | /                |                 |
%     |/                 |                 |
%     o----x             y                 o------ x
%                                         /
%                                        /
%                                       /
%                                      z
function scene = getScene(imgfile, annotationfile)
    %Parse annotation file
    scene = parseAnnotations(annotationfile);
    %Read input image, estimate diffuse reflectance
    [foo1,scene.name,foo2] = fileparts(imgfile);
    scene.img = im2double(imread(imgfile));
    [scene.h, scene.w,foo] = size(scene.img);
    scene.refl = colorRetinex(scene.img); %Diffuse reflectance estimate
    %Find 3D light positions
    scene.lights3d = getLights(scene.lights, scene.K, scene.R, scene.box3d);
    %Find 3D surfaces 
    scene.surfs3d = getExtrudedSurfaces(scene.surfs, scene.K, scene.R, scene.box3d);
    %Make sure 3D box projected points match 2d box points 
    scene.box_reproj = project(scene.box3d, scene.K, scene.R);
    %Rectify image texture to faces
    [scene.faces, scene.masks] = rectify(scene.refl, scene.box_reproj, scene.box3d);
    scene.faces = fillFaces(scene.faces, scene.masks);
    %Get shaft direction; matte and find image-space shafts
    [scene.shadowmatte, scene.shaft_dir] = getShadowMatte(scene.img, scene.box_reproj, ...
        scene.box3d, scene.shafts, scene.shaft_angle, scene.shaft_2d_source, ...
        scene.K, scene.R);
    scene.faces_alpha = getShafts(scene.shadowmatte, scene.box3d, scene.shaft_dir);
    scene.shaft_energy = 10;
    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%     VOODOO_TEST = 0;
%     if(VOODOO_TEST) %Test for voodoo cam
%         C = [BOX; LIGHTS{1}; SURFS{1}.top];
%         c = [box; lights{1}; SURFS{1}.top_uvs];
%         %K2 = [6.814/0.01066666 0 0.5*h; 0 6.814/0.01 0.5*w; 0 0 1]; %scene: tut
%         K2 = [9.0639384349/0.010 0 0.5*h; 0 9.0639384349/0.01 0.5*w; 0 0 1]; %scene: mylivingroom
%         R2 = R;
%         P = [K*R, zeros(3,1)]; P2 = [K2*R2, zeros(3,1)];
%         
%         Z = fminunc(@fun, reshape(eye(4,4),[16,1]));
%         Z = reshape(Z,[4,4]);
%         K = K2;
%         BOX = (Z*[BOX, ones(8,1)]')'; BOX = BOX(:,1:3);
%         LIGHTS{1} = (Z*[LIGHTS{1}, ones(size(LIGHTS{1},1),1)]')'; LIGHTS{1} = LIGHTS{1}(:,1:3);
%         SURFS{1}.top = (Z*[SURFS{1}.top, ones(size(SURFS{1}.top,1),1)]')'; SURFS{1}.top = SURFS{1}.top(:,1:3); 
%     end
%     function y = fun(x)
%         X = reshape(x, [4,4]);
%         reproj_c = P2*X*[C, ones(size(C,1),1)]';
%         reproj_c = (reproj_c(1:2,:)./repmat(reproj_c(3,:),[2,1]))';
%         y = sum(sum( (reproj_c-c).^2 ));
%     end
%     function [nc nceq] = nonlcon(x)
%         X = reshape(x, [4,4]);
%         nceq = reshape(P*X-P2, [12,1]);
%         nc = [];
%     end
    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
end
