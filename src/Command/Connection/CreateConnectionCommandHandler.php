<?php

namespace App\Command\Connection;

use App\Command\CommandHandlerInterface;
use App\Entity\Connection;
use App\Repository\BusStop\GetBusStopById;
use Doctrine\ORM\EntityManagerInterface;

final class CreateConnectionCommandHandler implements CommandHandlerInterface
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

    public function __invoke(CreateConnectionCommand $command): void
    {
        $from = $this->getBusStopById->__invoke($command->from());
        if (!$from) {
            throw new \RuntimeException('Bus stop not found');
        }

        $to = $this->getBusStopById->__invoke($command->to());
        if (!$to) {
            throw new \RuntimeException('Bus stop not found');
        }

        $connection = new Connection($command->id(), $from, $to);
        if ($command->geometry()) {
            $connection->changeGeometry($command->geometry());
        }
        $this->entityManager->persist($connection);
        $this->entityManager->flush();
    }
}