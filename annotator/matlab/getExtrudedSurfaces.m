function surfs3d  = getExtrudedSurfaces(surfs, K, R, box3d )
    surfs3d = cell(numel(surfs),1);
    P = K*R;
    for i=1:numel(surfs)
        %Project bottom/top of surface into 3D
        surftop = (P\[surfs{i}.height(1,:),1]')';
        surfbot = (P\[surfs{i}.height(2,:),1]')';
        %Bottom should lie on ground plane
        surfbot = box3d(1,2)./repmat(surfbot(2),[1,3]).*surfbot;
        %Top should be directly above bot (as close as possible)
        surftop = dot(surftop,surfbot)/dot(surftop,surftop).*surftop;
        %Extrude polygon
        surfs3d{i}.top = (P\[surfs{i}.poly,ones(size(surfs{i}.poly,1),1)]')';
        surfs3d{i}.top = surftop(2)./repmat(surfs3d{i}.top(:,2),[1,3]).*surfs3d{i}.top;
        surfs3d{i}.top_uvs = surfs{i}.poly;
        %Add bottom polygon if filled
        surfs3d{i}.bot = [];
        surfs3d{i}.bot_uvs = [];
        if(surfs{i}.solid)
            surfs3d{i}.bot = surfs3d{i}.top+repmat(surfbot-surftop, [size(surfs{i}.poly,1),1]);
            surfs3d{i}.bot_uvs = (P*surfs3d{i}.bot')';
            surfs3d{i}.bot_uvs = surfs3d{i}.bot_uvs(:,1:2)./repmat(surfs3d{i}.bot_uvs(:,3),[1,2]);
        end
    end
end

