<?php

namespace App\Command\BusStopGroup;

use App\Command\CommandHandlerInterface;
use App\Repository\BusStop\GetBusStopsByGroupId;
use App\Repository\BusStopGroup\GetBusStopGroupById;
use Doctrine\ORM\EntityManagerInterface;

final class DeleteBusStopGroupCommandHandler implements CommandHandlerInterface
{
    private $entityManager;
    private $getBusStopGroupById;
    private $getBusStopsByGroupId;

    public function __construct(
        EntityManagerInterface $entityManager,
        GetBusStopGroupById $getBusStopGroupById,
        GetBusStopsByGroupId $getBusStopsByGroupId
    )
    {
        $this->entityManager = $entityManager;
        $this->getBusStopGroupById = $getBusStopGroupById;
        $this->getBusStopsByGroupId = $getBusStopsByGroupId;
    }

    public function __invoke(DeleteBusStopGroupCommand $command): void
    {
        $busStopGroup = $this->getBusStopGroupById->__invoke($command->id());
        if (!$busStopGroup) {
            throw new \RuntimeException('Bus stop group not found');
        }

        $busStops = $this->getBusStopsByGroupId->__invoke($command->id());
        foreach ($busStops as $busStop) {
            $busStop->changeGroup(null);
        }

        $this->entityManager->remove($busStopGroup);
        $this->entityManager->flush();
    }
}