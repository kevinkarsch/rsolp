function blender25Export( scene, out_dir, BLENDER_BIN )
%BLENDEREXPORT Exports a scene created with getScene(...) to a Blender
%python script and .blend file (2.5x)
    
%Write images that blender will need to load
if(~exist(out_dir,'dir'))
    mkdir(out_dir);
end
tex_dir = fullfile(out_dir,'textures');
if(~exist(tex_dir,'dir'))
    mkdir(tex_dir);
end

%Weird flipping issue?
scene.faces{2} = flipdim(scene.faces{2}, 2);
scene.faces_alpha{2} = flipdim(scene.faces_alpha{2}, 2);

imwrite(scene.img, fullfile(out_dir,[scene.name '.png']));
imwrite(scene.refl, fullfile(tex_dir,[scene.name '-reflectance.png']));
imwrite(scene.faces{1}, fullfile(tex_dir,'mid.png'));
imwrite(scene.faces_alpha{1}, fullfile(tex_dir,'midTransp.png'));
imwrite(scene.faces{2}, fullfile(tex_dir,'left.png'));
imwrite(scene.faces_alpha{2}, fullfile(tex_dir,'leftTransp.png'));
imwrite(scene.faces{3}, fullfile(tex_dir,'top.png'));
imwrite(scene.faces_alpha{3}, fullfile(tex_dir,'topTransp.png'));
imwrite(scene.faces{4}, fullfile(tex_dir,'right.png'));
imwrite(scene.faces_alpha{4}, fullfile(tex_dir,'rightTransp.png'));
imwrite(scene.faces{5}, fullfile(tex_dir,'bot.png'));
imwrite(scene.faces_alpha{5}, fullfile(tex_dir,'botTransp.png'));
imwrite(scene.faces{6}, fullfile(tex_dir,'back.png'));
imwrite(scene.faces_alpha{6}, fullfile(tex_dir,'backTransp.png'));

%Write py file
fid = fopen(fullfile(out_dir, [scene.name '.py']), 'w');
fprintf(fid, 'import bpy\n');
fprintf(fid, 'import mathutils\n');
fprintf(fid, 'import string\n');
fprintf(fid, 'import math\n');
fprintf(fid, 'import os\n');
fprintf(fid, 'import math\n');
fprintf(fid, '\n');
fprintf(fid, 'os.chdir(''%s'')\n', cd(cd(out_dir))); %double cd shortcut to find abs path
fprintf(fid, '\n');
fprintf(fid, '#Set resolution\n');
fprintf(fid, 'render = bpy.context.scene.render\n');
fprintf(fid, 'render.filepath = ''//''\n');
fprintf(fid, 'render.resolution_x = %d\n', scene.w);
fprintf(fid, 'render.resolution_y = %d\n', scene.h);
fprintf(fid, 'render.resolution_percentage = 100\n');
fprintf(fid, '\n');
fprintf(fid, '#Create scene root node\n');
fprintf(fid, 'scene = bpy.context.scene\n');
fprintf(fid, 'root = bpy.data.objects.new(''scene'', None)\n');
fprintf(fid, 'root.location = (0, 0, 0)\n');
fprintf(fid, 'root.rotation_euler = (3.14159/2, 0, 0)\n');
if(scene.box3d(1,3)<scene.box3d(5,3)) %implies vpx.x < vpz.x; requires system flip
    fprintf(fid, 'root.scale = (1, 1, 1)\n');
else
    fprintf(fid, 'root.scale = (-1, 1, 1)\n');
end
fprintf(fid, 'scene.objects.link(root)\n');
fprintf(fid, '\n');
fprintf(fid, '#Create camera\n');
fprintf(fid, 'camdata = bpy.data.cameras.new(''cameraData'')\n');
fprintf(fid, 'camdata.lens_unit = ''DEGREES''\n');
fprintf(fid, 'cam = bpy.data.objects.new(''camera'', camdata)\n');
R = [1 0 0; 0 -1 0; 0 0 -1]*scene.R;
fprintf(fid, 'cam.matrix_local = ([%f, %f, %f, 0], [%f, %f, %f, 0], [%f, %f, %f, 0], [0, 0, 0, 1])\n', R');
fprintf(fid, 'f = %f\n', scene.K(1,1));
fprintf(fid, 'ppx = %f\n', scene.K(1,3));
fprintf(fid, 'ppy = %f\n', scene.K(2,3));
fprintf(fid, 'maxdim = max(render.resolution_x,render.resolution_y)\n');
fprintf(fid, 'camdata.angle = 2*math.atan(0.5*maxdim/f)\n');
fprintf(fid, 'camdata.shift_x = -(render.resolution_x/2-ppx)/maxdim\n');
fprintf(fid, 'camdata.shift_y = -(render.resolution_y/2-ppy)/maxdim\n');
fprintf(fid, 'camdata.dof_distance = 0.0\n');
p = fitPlane(scene.box3d([8,7,6,5],:));
rays = ((scene.K*scene.R)\[1 scene.w scene.w 1; 1 1 scene.h scene.h; 1 1 1 1])';
[foo1,t1] = rayPlaneIntersect([0,0,0], rays(1,:), p);
[foo2,t2] = rayPlaneIntersect([0,0,0], rays(2,:), p);
[foo3,t3] = rayPlaneIntersect([0,0,0], rays(3,:), p);
[foo4,t4] = rayPlaneIntersect([0,0,0], rays(4,:), p);
fprintf(fid, 'camdata.clip_start = %f\n', 0.1+max([t1,t2,t3,t4, 0]) );
fprintf(fid, 'camdata.clip_end = 1000.0\n');
fprintf(fid, 'camdata.luxrender_camera.use_clipping = True\n');
fprintf(fid, 'camdata.luxrender_camera.luxrender_film.write_png = True\n');
fprintf(fid, 'camdata.luxrender_camera.luxrender_film.write_flm = False\n');
fprintf(fid, 'camdata.luxrender_camera.luxrender_film.luxrender_tonemapping.type = ''linear''\n');
fprintf(fid, 'bpy.context.scene.luxrender_sampler.haltspp = %d\n', 500);
fprintf(fid, 'scene.objects.link(cam)\n');
fprintf(fid, 'cam.parent = root\n');
fprintf(fid, 'bpy.data.scenes[0].camera = bpy.data.objects[''camera'']\n');
fprintf(fid, '\n');

walls = {'mid','left','top','right','bot','back'};
faceverts = {[0,1,2,3], [5,4,0,1], [1,5,6,2], [3,2,6,7], [4,0,3,7], [7,6,5,4]};
fprintf(fid, '########## Scene boundaries ##########\n');
fprintf(fid, '\n');
fprintf(fid, '#Box verts\n');
fprintf(fid, 'verts = ((%f, %f, %f),\n', scene.box3d(1,:));
fprintf(fid, '         (%f, %f, %f),\n', scene.box3d(2,:));
fprintf(fid, '         (%f, %f, %f),\n', scene.box3d(3,:));
fprintf(fid, '         (%f, %f, %f),\n', scene.box3d(4,:));
fprintf(fid, '         (%f, %f, %f),\n', scene.box3d(5,:));
fprintf(fid, '         (%f, %f, %f),\n', scene.box3d(6,:));
fprintf(fid, '         (%f, %f, %f),\n', scene.box3d(7,:));
fprintf(fid, '         (%f, %f, %f))\n', scene.box3d(8,:));
fprintf(fid, '\n');
for i=1:6    
    fprintf(fid, '#%s wall\n', walls{i});
    fprintf(fid, 'name = ''%s''\n', walls{i});
    fprintf(fid, 'me = bpy.data.meshes.new(name+''Mesh'')\n');
    fprintf(fid, 'ob = bpy.data.objects.new(name, me)  \n');
    fprintf(fid, 'bpy.context.scene.objects.link(ob)\n');
    fprintf(fid, 'ob.parent = root\n');
    fprintf(fid, 'me.from_pydata(verts, [], [(%f,%f,%f,%f)])\n', faceverts{i});
    fprintf(fid, 'me.update(calc_edges=True)\n');
    fprintf(fid, 'mat = bpy.data.materials.new(name+''Mat'')\n');
    fprintf(fid, 'mat.use_shadeless = True\n');
    fprintf(fid, 'mat.diffuse_intensity = 1\n');
    fprintf(fid, 'mat.specular_intensity = 0\n');
    fprintf(fid, 'texslot = mat.texture_slots.add()\n');
    fprintf(fid, 'texslot.texture_coords = ''UV''\n');
    fprintf(fid, 'texslot.texture = bpy.data.textures.new(name+''Tex'', ''IMAGE'')\n');
    fprintf(fid, 'texslot.texture.image = bpy.data.images.load(''//textures/''+name+''.png'')\n');
    fprintf(fid, 'texslot.texture.luxrender_texture.type_label = ''Use Blender Texture''\n');
    fprintf(fid, 'texslottrans = mat.texture_slots.add()\n');
    fprintf(fid, 'texslottrans.texture_coords = ''UV''\n');
    fprintf(fid, 'texslottrans.texture = bpy.data.textures.new(name+''TexTransp'', ''IMAGE'')\n');
    fprintf(fid, 'texslottrans.texture.image = bpy.data.images.load(''//textures/''+name+''Transp.png'')\n');
    fprintf(fid, 'texslottrans.use = False\n');
    fprintf(fid, 'mat.luxrender_material.luxrender_mat_matte.Kd_usecolortexture = True\n');
    fprintf(fid, 'mat.luxrender_material.luxrender_mat_matte.Kd_colortexturename = texslot.texture.name\n');
    fprintf(fid, 'mat.luxrender_transparency.transparent = True\n');
    fprintf(fid, 'mat.luxrender_transparency.alpha_source = ''texture''\n');
    fprintf(fid, 'mat.luxrender_transparency.alpha_usefloattexture = True\n');
    fprintf(fid, 'mat.luxrender_transparency.alpha_floattexturename = texslottrans.texture.name\n');
    fprintf(fid, 'mat.luxrender_transparency.inverse = True\n');
    fprintf(fid, 'me.materials.append(mat)\n');
    fprintf(fid, 'uvTex = me.uv_textures.new(name+''UVTex'')\n');
    fprintf(fid, 'uvTex.data[0].uv = [(0,0), (0,1), (1,1), (1,0)]\n');
    fprintf(fid, '\n');
end
fprintf(fid, '\n');

fprintf(fid, '########## Lights ##########\n');
for i=1:numel(scene.lights3d)
    fprintf(fid, 'name = ''light%d''\n', i);
    fprintf(fid, 'me = bpy.data.meshes.new(name+''Mesh'')\n');
    fprintf(fid, 'ob = bpy.data.objects.new(name, me)  \n');
    fprintf(fid, 'bpy.context.scene.objects.link(ob)\n');
    fprintf(fid, 'ob.parent = root\n');
    fprintf(fid, 'lv = (\n');
    tristr = '';
    for j=1:size(scene.lights3d{i}.verts,1)
        fprintf(fid, '      (%f,%f,%f),\n', scene.lights3d{i}.verts(j,:));
        if(j < size(scene.lights3d{i}.verts,1)-1)
            tristr = sprintf('%s(%d,%d,%d), ', tristr, 0,j,j+1);
        end
    end
    fprintf(fid, '     )\n');
    fprintf(fid, 'me.from_pydata(lv, [], [%s])\n',tristr(1:end-2));
    fprintf(fid, 'me.update(calc_edges=True)\n');
    fprintf(fid, 'emit_mat = bpy.data.materials.new(name+''Mat'')\n');
    fprintf(fid, 'emit_mat.luxrender_emission.use_emission = True\n');
    fprintf(fid, 'emit_mat.luxrender_emission.gain = %f\n', scene.lights3d{i}.gain);
    fprintf(fid, 'emit_mat.luxrender_emission.L_color = [%f, %f, %f]\n', scene.lights3d{i}.L_color);
    fprintf(fid, 'me.materials.append(emit_mat)\n');
    fprintf(fid, '\n');
end
fprintf(fid, '\n');

%If any shafts exist, add a directional light lamp
if( ~isempty(scene.shaft_dir) )
    fprintf(fid, '########## Sun ##########\n');
    fprintf(fid, 'sun = bpy.data.lamps.new(''sunLamp'', type=''HEMI'')\n');
    fprintf(fid, 'sun.luxrender_lamp.luxrender_lamp_hemi.type = ''distant''\n');
    fprintf(fid, 'sun.energy = %f\n', scene.shaft_energy);
    fprintf(fid, 'ob = bpy.data.objects.new(''sun'', sun)\n');
    fprintf(fid, 'bpy.context.scene.objects.link(ob)\n');
    fprintf(fid, 'ob.parent = root\n');
    %Convert shaft dir to rot matrix
    if(size(scene.shaft_dir,2)~=3)
        scene.shaft_dir = scene.shaft_dir';
    end
    scene.shaft_dir = scene.shaft_dir./norm(scene.shaft_dir);
    d = scene.shaft_dir(3);
    xr = [0,0,1];
    if(abs(d)<1-1e-4)
            xr = xr-scene.shaft_dir*d;
            xr = xr ./ norm(xr);
            yr = cross(xr, scene.shaft_dir);
    else
            xr = [scene.shaft_dir(3),0,-scene.shaft_dir(1)];
            yr = [0,1,0];
    end
    fprintf(fid, 'ob.matrix_local = mathutils.Matrix(([%f, %f, %f, 0], [%f, %f, %f, 0], [%f, %f, %f, 0], [0, 0, 0, 1]))\n', xr, yr, scene.shaft_dir);
    fprintf(fid, 'ob.location = [%f, %f, %f]\n', mean(scene.box3d,1));
end
fprintf(fid, '\n');

fprintf(fid, '########## Supporting surfaces ##########\n');
fprintf(fid, '#Image as material for extruded objects\n');
fprintf(fid, 'mat = bpy.data.materials.new(''sceneMat'')\n');
fprintf(fid, 'mat.use_shadeless = True\n');
fprintf(fid, 'mat.diffuse_intensity = 1\n');
fprintf(fid, 'mat.specular_intensity = 0\n');
fprintf(fid, 'texslot = mat.texture_slots.add()\n');
fprintf(fid, 'texslot.texture_coords = ''UV''\n');
fprintf(fid, 'texslot.texture = bpy.data.textures.new(''sceneTex'', ''IMAGE'')\n');
fprintf(fid, 'texslot.texture.image = bpy.data.images.load(''//textures/%s-reflectance.png'')\n', scene.name);
fprintf(fid, 'texslot.texture.luxrender_texture.type_label = ''Use Blender Texture''\n');
fprintf(fid, 'mat.luxrender_material.luxrender_mat_matte.Kd_usecolortexture = True\n');
fprintf(fid, 'mat.luxrender_material.luxrender_mat_matte.Kd_colortexturename = texslot.texture.name\n');
fprintf(fid, '\n');
for i=1:numel(scene.surfs3d)
    fprintf(fid, 'name = ''surf%d''\n', i);
    fprintf(fid, 'me = bpy.data.meshes.new(name+''Mesh'')\n');
    fprintf(fid, 'ob = bpy.data.objects.new(name, me)  \n');
    fprintf(fid, 'bpy.context.scene.objects.link(ob)\n');
    fprintf(fid, 'ob.parent = root\n');
    fprintf(fid, 'sv = (\n');
    %Get Blender representation of extruded surface, top first
    tristr = '';
    uvstr = {};
    top = scene.surfs3d{i}.top;
    top_uv = scene.surfs3d{i}.top_uvs;
    top_uv(:,2) = scene.h - top_uv(:,2); %Blender img cs conversion
    top_uv = top_uv./repmat([scene.w,scene.h],[size(top_uv,1),1]); %normalize
    for j=1:size(top,1)
        fprintf(fid, '      (%f,%f,%f),\n', top(j,:));
        if(j < size(top,1)-1)
            tristr = sprintf('%s(%d,%d,%d), ', tristr, 0,j,j+1);
            uvstr{end+1} = sprintf('(%f,%f), (%f, %f), (%f, %f)', top_uv(1,:), top_uv(j+1,:), top_uv(j+2,:)); %#ok<AGROW>
        end
    end
    if( ~isempty(scene.surfs3d{i}.bot) )
        %Then bot
        bot = scene.surfs3d{i}.bot;
        bot_uv = scene.surfs3d{i}.bot_uvs;
        bot_uv(:,2) = scene.h - bot_uv(:,2); %Blender img cs conversion
        bot_uv = bot_uv./repmat([scene.w,scene.h],[size(bot_uv,1),1]); %normalize
        foffset = size(top,1);
        for j=1:size(bot,1)
            fprintf(fid, '      (%f,%f,%f),\n', bot(j,:));
            if(j < size(bot,1)-1)
                tristr = sprintf('%s(%d,%d,%d), ', tristr, foffset,foffset+j,foffset+j+1);
                uvstr{end+1} = sprintf('(%f,%f), (%f, %f), (%f, %f)', bot_uv(1,:), bot_uv(j+1,:), bot_uv(j+2,:)); %#ok<AGROW>
            end
        end
        %And then connect top and bot (no new verts, just faces/uvs
        for j=1:size(top,1)
            if(j<size(top,1)); jn = j+1; else jn = 1; end
            tristr = sprintf('%s(%d,%d,%d), ', tristr, j-1, foffset+j-1,foffset+jn-1);
            tristr = sprintf('%s(%d,%d,%d), ', tristr, j-1, foffset+jn-1,jn-1);
            uvstr{end+1} = sprintf('(%f,%f), (%f, %f), (%f, %f)', top_uv(j,:), bot_uv(j,:), bot_uv(jn,:)); %#ok<AGROW>
            uvstr{end+1} = sprintf('(%f,%f), (%f, %f), (%f, %f)', top_uv(j,:), bot_uv(jn,:), top_uv(jn,:)); %#ok<AGROW>
        end
    end
    fprintf(fid, '     )\n');
    fprintf(fid, 'me.from_pydata(sv, [], [%s])\n', tristr(1:end-2));
    fprintf(fid, 'me.update(calc_edges=True)\n');
    fprintf(fid, 'me.materials.append(mat)\n');
    fprintf(fid, 'uvTex = me.uv_textures.new(name+''UVTex'')\n');
    for j=1:numel(uvstr)
        fprintf(fid, 'uvTex.data[%d].uv = [%s]\n', j-1, uvstr{j});
    end
    fprintf(fid, '\n');
end
fprintf(fid, 'bpy.context.scene.update()\n');

%Save to file
fprintf(fid, 'bpy.ops.wm.save_mainfile(filepath="%s.blend")\n', scene.name);

fprintf(fid, '\n');
fclose(fid);

%Create the blender scene (.blend) file
[result,foo] = system(sprintf('cd %s; sudo %s -b -P %s', out_dir, BLENDER_BIN, [scene.name '.py']));

