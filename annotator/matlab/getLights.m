function lights3d = getLights( lights, K, R, box3d )
    lights3d = cell(numel(lights),1);
    cam_center = [0;0;0];
    for i=1:numel(lights)
        lights3d{i}.verts = unproject(lights{i}, K, R, box3d);
        lights3d{i}.gain = 25;
        lights3d{i}.L_color = [0.5,0.5,0.5];
        %Ensure normal is facing camera
        V = mean(lights3d{i}.verts,1)-cam_center';
        N = cross(lights3d{i}.verts(1,:)-lights3d{i}.verts(2,:),lights3d{i}.verts(2,:)-lights3d{i}.verts(3,:));
        if( dot(V./norm(V), N./norm(N)) > 0 )
            lights3d{i}.verts = flipdim(lights3d{i}.verts,1);
        end
    end
end

