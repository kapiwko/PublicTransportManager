<?php

namespace App\Command\BusStopGroup;

use App\Command\CommandHandlerInterface;
use App\Repository\BusStopGroup\GetBusStopGroupById;
use Doctrine\ORM\EntityManagerInterface;

final class UpdateBusStopGroupCommandHandler implements CommandHandlerInterface
{
    private $entityManager;
    private $getBusStopGroupById;

    public function __construct(
        EntityManagerInterface $entityManager,
        GetBusStopGroupById $getBusStopGroupById
    )
    {
        $this->entityManager = $entityManager;
        $this->getBusStopGroupById = $getBusStopGroupById;
    }

    public function __invoke(UpdateBusStopGroupCommand $command): void
    {
        $busStopGroup = $this->getBusStopGroupById->__invoke($command->id());
        if (!$busStopGroup) {
            throw new \RuntimeException('Bus stop group not found');
        }

        $busStopGroup->changeName($command->name());
        $this->entityManager->flush();
    }
}