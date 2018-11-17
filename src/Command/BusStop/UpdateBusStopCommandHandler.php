<?php

namespace App\Command\BusStop;

use App\Command\CommandHandlerInterface;
use App\Repository\BusStop\GetBusStopById;
use App\Repository\BusStopGroup\GetBusStopGroupById;
use Doctrine\ORM\EntityManagerInterface;

final class UpdateBusStopCommandHandler implements CommandHandlerInterface
{
    private $entityManager;
    private $getBusStopById;
    private $getBusStopGroupById;

    public function __construct(
        EntityManagerInterface $entityManager,
        GetBusStopById $getBusStopById,
        GetBusStopGroupById $getBusStopGroupById
    )
    {
        $this->entityManager = $entityManager;
        $this->getBusStopById = $getBusStopById;
        $this->getBusStopGroupById = $getBusStopGroupById;
    }

    public function __invoke(UpdateBusStopCommand $command): void
    {
        $busStop = $this->getBusStopById->__invoke($command->id());
        if (!$busStop) {
            throw new \RuntimeException('Bus stop not found');
        }

        $busStop->changeLocation($command->location());
        $group = $command->group() ? $this->getBusStopGroupById->__invoke($command->group()) : null;
        $busStop->changeGroup($group);
        $this->entityManager->flush();
    }
}