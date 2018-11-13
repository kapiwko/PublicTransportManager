<?php

namespace App\Command\Line;

use App\Command\CommandHandlerInterface;
use App\Entity\Line;
use App\Repository\Connection\GetConnectionById;
use Doctrine\ORM\EntityManagerInterface;

final class CreateLineCommandHandler implements CommandHandlerInterface
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

    public function __invoke(CreateLineCommand $command): void
    {
        $line = new Line($command->id(), $command->name());

        foreach ($command->connections() as $uuid) {
            $connection = $this->getConnectionById->__invoke($uuid);
            if (!$connection) {
                throw new \RuntimeException('Connection not found');
            }
            $line->addConnection($connection);
        }
        $this->entityManager->persist($line);
        $this->entityManager->flush();
    }
}