<?php

namespace App\Command\Connection;

use App\Command\CommandHandlerInterface;
use App\Repository\Connection\GetConnectionById;
use Doctrine\ORM\EntityManagerInterface;

final class UpdateConnectionCommandHandler implements CommandHandlerInterface
{
    private $entityManager;
    private $getConnectionById;

    public function __construct(
        EntityManagerInterface $entityManager,
        GetConnectionById $getConnectionById
    )
    {
        $this->entityManager = $entityManager;
        $this->getConnectionById = $getConnectionById;
    }

    public function __invoke(UpdateConnectionCommand $command): void
    {
        $connection = $this->getConnectionById->__invoke($command->id());
        if (!$connection) {
            throw new \RuntimeException('Connection not found');
        }

        $connection->changeGeometry($command->geometry());
        $this->entityManager->flush();
    }
}