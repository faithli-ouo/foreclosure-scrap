import { Test, TestingModule } from '@nestjs/testing';
import { ObjectHandelService } from './object-handel.service';

describe('ObjectHandelService', () => {
  let service: ObjectHandelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ObjectHandelService],
    }).compile();

    service = module.get<ObjectHandelService>(ObjectHandelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
