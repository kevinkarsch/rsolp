function [matte, dir] = getShadowMatte( img, box, box3d, shafts, shaft_angle, ...
                                        shaft_2d_source, K, R)   
    CLEANEDSRC_SHADOW2_DIR = '/srv/rsolp/rsolp/src/matlab/cleanedsrc_shadow2';
    %Get 3D shaft direction
    if(numel(shafts)==0)
        dir=[];
    elseif(isempty(shaft_2d_source))
        [x,z,y] = sph2cart(shaft_angle(2)*pi, shaft_angle(1)*pi,1); %xzy due to matlab's cs
        if(box3d(1,3)<box3d(5,3)) %implies vpx.x < vpz.x; requires system flip
            dir = R*[x;-y;-z];
        else
            dir = R*[x;-y;z];
        end
    else
        shafts_concat = [];
        for i=1:numel(shafts)
            shafts_concat = [shafts_concat; shafts{i}.poly]; %#ok<AGROW>
        end
        shafts3d = unproject(shafts_concat, K, R, box3d);
        shafts_3d_centroid = mean(shafts3d,1);
        shaft_3d_source = unproject(shaft_2d_source, K, R, box3d);
        dir = shafts_3d_centroid - shaft_3d_source;
        dir = dir./norm(dir);
        dir = -dir; %??
    end
    
    %Get initial shaft mask (manual input)
    [h,w,d] = size(img);
    man_matte = zeros(h,w);
    for i=1:numel(shafts)
        if(~shafts{i}.matte)
            man_matte = man_matte + poly2mask(shafts{i}.poly(:,1),shafts{i}.poly(:,2), h, w);
        end
    end
    man_matte = double(man_matte>0);
    matte = rectify(man_matte, box, box3d);
    %Get shadow matted mask and add to initial shaft mask
    shadow_matte = zeros(h,w);
    for i=1:numel(shafts)
        if(shafts{i}.matte)
            shadow_matte = shadow_matte + poly2mask(shafts{i}.poly(:,1),shafts{i}.poly(:,2), h, w);
        end
    end
    shadow_matte(shadow_matte>1) = 1;
    faces_orig = rectify(img, box, box3d);
    facemasks = rectify(shadow_matte, box, box3d);
    for i=1:6
        if(max(facemasks{i}(:))>0)
            cd(CLEANEDSRC_SHADOW2_DIR);
            matte{i} = matte{i} + facemasks{i}.*(1-main(faces_orig{i}.*repmat(facemasks{i},[1,1,3])));
            matte{i}(matte{i}>1) = 1; 
            cd(fullfile(CLEANEDSRC_SHADOW2_DIR,'..'));
        end
    end
end

