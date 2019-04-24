function scene_out = optimizeLightParams(scene, BLENDER_BIN)
    OPTIMIZE_RGB = 0;
    tmpdir = ['.tmp-' timestamp()];
    tmpscene = scene;
    renderparams.h = 10;
    renderparams.w = 10;
    renderparams.halt_spp = 50;
    renderparams.outpath = '//';
    
    %Downsample image and get initial rendered image
    I = im2double(imresize(scene.img, [renderparams.h,renderparams.w], 'bilinear'));
    R0 = renderScene(tmpscene, tmpdir, renderparams, BLENDER_BIN);
    
    N = numel(scene.lights3d);
    
    %Initialize with least squares
    intensity = R0(:)\I(:);
    for j=1:N
        tmpscene.lights3d{j}.gain = intensity .* tmpscene.lights3d{j}.gain;
    end
    tmpscene.shaft_energy = intensity .* tmpscene.shaft_energy;
    
    
    function x = getlightparams()
        if(OPTIMIZE_RGB)
            x = zeros(N*4,1);
        else
            x = zeros(N,1);
        end
        for i=1:N
            if(OPTIMIZE_RGB)
                x((i-1)*4+(1:4)) = [tmpscene.lights3d{i}.gain, tmpscene.threeD.LIGHTS{i}.L_color(1:3)]';
            else
                x(i) = tmpscene.lights3d{i}.gain;
            end
        end
        if( ~isempty(scene.shaft_dir) )
            x(end+1) = tmpscene.shaft_energy;
        end
    end
    function sc = setlightparams(x)
        sc = tmpscene;
        for i=1:N
            if(OPTIMIZE_RGB)
                sc.lights3d{i}.gain = x((i-1)*4+1);
                sc.lights3d{i}.L_color = x((i-1)*4+(2:4))';
            else
                sc.lights3d{i}.gain = x(i);
            end
        end
        if( ~isempty(scene.shaft_dir) )
            sc.shaft_energy = x(end);
        end
    end
    k = numel(getlightparams());
    options = optimset('UseParallel', 'never', ...
                       'Algorithm', 'active-set', ...
                       'TolFun', 1e-8, ...
                       'TolCon', 1e-8, ...
                       'MaxFunEvals', 50, ...
                       'Display', 'iter'); %iter-detailed');
    x0 = getlightparams();
    fval0 = fun(x0);
    [x,fval] = fmincon(@fun, x0,[],[],[],[],ones(k,1),Inf(k,1), [], options);
    function f = fun(x)
         tsc = setlightparams(x);
         R = renderScene(tsc, tmpdir, renderparams, BLENDER_BIN);
         f = phi(I,R);
    end
    if(f<fval0)
        scene_out = setlightparams(x);
    else
        scene_out = setlightparams(x0);
    end
    Rf = renderScene(scene_out, tmpdir, renderparams, BLENDER_BIN);
    %figure, imshow([I,R0,Rf]);
    
    rmdir(tmpdir, 's');
end

function R = renderScene(scene, dir, params, BLENDER_BIN)
    blender25Export(scene, dir, BLENDER_BIN);
    renderLuxblend(fullfile(dir, [scene.name, '.blend']), BLENDER_BIN, params, true);
    R = im2double(imread(fullfile(dir, [scene.name, '.Scene.00001.png'])));
end

function f = phi(x,y) %distance function (just ssd)
    f = mean((x(:)-y(:)).^2);
end
