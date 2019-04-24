function alpha = getShafts( matte, C, dir)
    if(isempty(dir))
        dir = [1,0,0];
    end
    alpha = cell(6,1);
    alpha{5} = zeros(size(matte{5}));
    for i=[1,2,3,4,6] %Assume no shafts are coming from the floor (i=5)
        qto = getquad(C,i);
        alpha{i} = zeros(size(matte{i}));
        for j=[1,2,4,5,6] %Assume no shafts project from the ceiling (j=3)
            if(i==j)
                continue; %Don't project onto itself
            end
            qfrom = getquad(C,j);
            alpha{i} = alpha{i} + mexProjectShafts(matte{j}, qfrom, qto, size(alpha{i}), dir); 
        end
    end
end

function q = getquad(pts3d, idx)
    if(idx==1)
        q = pts3d([2,3,4,1],:);
    elseif(idx==2)
        q = pts3d([6,2,1,5],:);
    elseif(idx==3)
        q = pts3d([6,7,3,2],:);
    elseif(idx==4)
        q = pts3d([3,7,8,4],:);
    elseif(idx==5)
        q = pts3d([1,4,8,5],:);
    elseif(idx==6)
        q = pts3d([7,6,5,8],:);
    end
end
