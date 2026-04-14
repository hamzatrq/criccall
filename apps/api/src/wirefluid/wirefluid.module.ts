import { Global, Module } from '@nestjs/common';
import { WireFluidService } from './wirefluid.service';

@Global()
@Module({
  providers: [WireFluidService],
  exports: [WireFluidService],
})
export class WireFluidModule {}
