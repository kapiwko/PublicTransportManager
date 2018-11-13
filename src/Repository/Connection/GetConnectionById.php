<?php

namespace App\Repository\Connection;

use App\Entity\Connection;
use Doctrine\ORM\EntityManagerInterface;
use Ramsey\Uuid\UuidInterface;

class GetConnectionById
{
    private $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    public function __invoke(UuidInterface $id): ?Connection
    {
        $queryBuilder = $this->entityManager->createQueryBuilder();
        $queryBuilder->select('connection');
        $queryBuilder->from(Connection::class,'connection');
        $queryBuilder->where('connection.id = :id');
        $queryBuilder->setParameter('id', $id);
        $queryBuilder->groupBy('connection.id');
        $query = $queryBuilder->getQuery();
        return $query->getOneOrNullResult();
    }
}