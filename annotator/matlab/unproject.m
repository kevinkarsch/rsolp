function X = unproject(x, K, R, box3d)
    P = K*R;
    k = size(x,1);
    ray = (P\[x, ones(k,1)]')';
    [pN, d] = getWallPlaneEqs(box3d);
    ray_dot_pN = sum(repmat(reshape(ray',[1,3,k]),[5,1,1]).*repmat(pN,[1,1,k]),2);
    t = -repmat(d,[1,1,k])./ray_dot_pN;
    t(t<0|ray_dot_pN<0) = Inf; %Only project along direction of ray, make sure plane is front facing
    t_min = reshape(min(t,[],1),[k,1]);
    X = repmat(t_min+eps,[1,3]).*ray;
end

function [plane_normals, plane_d] = getWallPlaneEqs(box3d)
    %Returns the normals of each of the box faces (except the back wall)
    pts = [box3d(2,:); box3d(1:4,:)];
    plane_normals = [cross(box3d(2,:)-box3d(1,:),box3d(2,:)-box3d(3,:));
                     cross(box3d(1,:)-box3d(2,:),box3d(1,:)-box3d(5,:));
                     cross(box3d(2,:)-box3d(3,:),box3d(2,:)-box3d(6,:));
                     cross(box3d(3,:)-box3d(4,:),box3d(3,:)-box3d(7,:));
                     cross(box3d(4,:)-box3d(1,:),box3d(4,:)-box3d(8,:))];
    if(box3d(1,3)<box3d(5,3)) %implies vpx.x < vpz.x; requires system flip
        plane_normals = -plane_normals;
    end    
    plane_normals = plane_normals./repmat(sqrt(sum(plane_normals.^2,2)),[1,3]);
    plane_d = -sum(plane_normals.*pts,2);
end
