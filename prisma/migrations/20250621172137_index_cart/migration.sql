-- CreateIndex
CREATE INDEX "CartItem_userId_productId_idx" ON "CartItem"("userId", "productId");

-- CreateIndex
CREATE INDEX "CartItem_userId_idx" ON "CartItem"("userId");
