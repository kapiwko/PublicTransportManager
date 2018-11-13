<?php

namespace App\Command\Line;

use App\Command\CommandHandlerInterface;
use App\Repository\Connection\GetConnectionById;
use App\Repository\Line\GetLineById;
use Doctrine\ORM\EntityManagerInterface;

final class UpdateLineCommandHandler implements CommandHandlerInterface
{
    private $entityManager;
    private $getLineById;
    private $getConnectionById;

    public function __construct(
        EntityManagerInterface $entityManager,
        GetLineById $getLineById,
        GetConnectionById $getConnectionById
    )
    {
        $this->entityManager = $entityManager;
        $this->getLineById = $getLineById;
        $this->getConnectionById = $getConnectionById;
    }

    public function __invoke(UpdateLineCommand $command): void
    {
        $line = $this->getLineById->__invoke($command->id());
        if (!$line) {
            throw new \RuntimeException('Line not found');
        }

        $line->changeName($command->name());
        $line->clearConnections();
        foreach ($command->connections() as $uuid) {
            $connection = $this->getConnectionById->__invoke($uuid);
            if (!$connection) {
                throw new \RuntimeException('Connection not found');
            }
            $line->addConnection($connection);
        }
        $this->entityManager->flush();
    }
}