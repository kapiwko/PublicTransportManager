<?php

namespace App\Command\BusStop;

use App\Command\CommandHandlerInterface;
use App\Repository\BusStop\GetBusStopById;
use Doctrine\ORM\EntityManagerInterface;

final class DeleteBusStopCommandHandler implements CommandHandlerInterface
{
    private $entityManager;
    private $getBusStopById;

    public function __construct(
        EntityManagerInterface $entityManager,
        GetBusStopById $getBusStopById
    )
    {
        $this->entityManager = $entityManager;
        $this->getBusStopById = $getBusStopById;
    }

    public function __invoke(DeleteBusStopCommand $command): void
    {
        $busStop = $this->getBusStopById->__invoke($command->id());
        if (!$busStop) {
            throw new \RuntimeException('Bus stop not found');
        }

        $this->entityManager->remove($busStop);
        $this->entityManager->flush();
    }
}